import { Fragment, useEffect, useMemo, useRef } from 'react';

import { useTranslation } from 'react-i18next';

import { NetSuiteLinkedRecord } from './components/NetSuiteLinkedRecord';
import { RecordType, LinkedRecordType } from './constants';
import { useEngageInfoChanged } from './hooks/useEnageInfoChanged';
import { useIconCreator } from './hooks/useIconCreator';
import type { FormData, INetSuiteLogFormProps } from './types';
import { useAngularModule } from '../../../components/CRM/Hooks/useAngularModule';
import { useCreateFields } from '../../../components/CRM/Hooks/useCreateFields';
import { useDataTracking } from '../../../components/CRM/Hooks/useDataTracking';
import {
    CRMLogForm,
    CRMMatchField,
    CRMSubjectField,
} from '../../../components/CRM/LogForm';
import type { MatchItem } from '../../../components/CRM/types';
import injector from '../../../helpers/injector';

const hasOwnField = (obj: object, field: keyof FormData) =>
    Object.prototype.hasOwnProperty.call(obj, field);

const normalizeFormDataChange = (
    currentFormData: FormData,
    val: Partial<FormData>
) => {
    const {
        company: newCompanyVal,
        contact: newContactVal,
        supportCase: newSupportCaseVal,
        transaction: newTransactionVal,
        ...restVal
    } = val;

    const resolvedCompany = Array.isArray(newCompanyVal)
        ? newCompanyVal[0] || null
        : hasOwnField(val, 'company')
          ? newCompanyVal || null
          : currentFormData.company;

    const shouldClearRelatedFields =
        !resolvedCompany?.id ||
        resolvedCompany.id !== currentFormData.company?.id;

    const getNextLinkedRecord = (
        field: LinkedRecordType,
        newValue?: MatchItem | null,
        currentValue?: MatchItem | null
    ) => {
        if (shouldClearRelatedFields) {
            return null;
        }

        if (!hasOwnField(val, field)) {
            return currentValue || null;
        }

        return newValue || null;
    };

    return {
        ...currentFormData,
        ...restVal,
        company: resolvedCompany,
        contact: getNextLinkedRecord(
            LinkedRecordType.CONTACT,
            newContactVal,
            currentFormData.contact
        ),
        supportCase: getNextLinkedRecord(
            LinkedRecordType.SUPPORTCASE,
            newSupportCaseVal,
            currentFormData.supportCase
        ),
        transaction: getNextLinkedRecord(
            LinkedRecordType.TRANSACTION,
            newTransactionVal,
            currentFormData.transaction
        ),
    };
};

export const NetSuiteLogForm: React.FC<INetSuiteLogFormProps> = ({
    disabled,
    isLoading,
    engageInfo,
    formData,
    matchedCompanies = [],
    hyperlinkType,
    engageType,
    fields,
    selectedContact,
    selectedSupportCase,
    selectedTransaction,
    onEngageInfoChanged,
    onFormDataChanged,
    resetHyperlinkType,
    reloadMatchedList,
}) => {
    const growl = injector('growl');
    const { t } = useTranslation();
    const CrmSvc = useAngularModule('CrmSvc');
    const previousMatchedCompaniesRef = useRef<MatchItem[]>(matchedCompanies);
    const { createFields, handleCreateRecord } = useCreateFields(
        fields,
        engageInfo
    );
    const iconCreator = useIconCreator();

    const displayMatchedCompanies = useMemo(() => {
        const selectedCompany = formData.company;

        if (!selectedCompany?.id) {
            return matchedCompanies;
        }

        if (matchedCompanies.some((item) => item.id === selectedCompany.id)) {
            return matchedCompanies;
        }

        const previousIndex = previousMatchedCompaniesRef.current.findIndex(
            (item) => item.id === selectedCompany.id
        );

        if (previousIndex === -1) {
            return [selectedCompany, ...matchedCompanies];
        }

        const nextMatchedCompanies = [...matchedCompanies];
        nextMatchedCompanies.splice(
            Math.min(previousIndex, nextMatchedCompanies.length),
            0,
            selectedCompany
        );

        return nextMatchedCompanies;
    }, [formData.company, matchedCompanies]);

    useEffect(() => {
        previousMatchedCompaniesRef.current = displayMatchedCompanies;
    }, [displayMatchedCompanies]);

    useEngageInfoChanged(
        formData,
        displayMatchedCompanies,
        onEngageInfoChanged
    );

    useDataTracking({
        isMatched: !isLoading,
        peopleMatchedItems: displayMatchedCompanies,
    });

    const defaultCompanyWhenNotSelect = matchedCompanies?.length
        ? t(`CRM.NETSUITE.SELECT_COMPANY`)
        : t(`CRM.NETSUITE.CREATE_COMPANY`);

    const selectedCompany = formData.company?.id ? [formData.company] : [];

    const handleFormDataChanged = (val: Partial<FormData>) => {
        const newFormData = normalizeFormDataChange(formData, val);
        onFormDataChanged(newFormData);
    };

    useEffect(() => {
        if (engageInfo.uii) {
            CrmSvc.submitCallLogWithCallback({
                type: engageType,
                uii: engageInfo.uii,
                netSuiteLogInfo: {
                    ...formData,
                    displayName: formData?.company?.name,
                },
            });
        }
    }, [formData, engageInfo.uii]);

    useEffect(() => {
        if (
            displayMatchedCompanies?.length === 1 &&
            formData.company === undefined
        ) {
            handleFormDataChanged({
                company: displayMatchedCompanies[0],
            });
        } else if (!isLoading && formData.company === undefined) {
            handleFormDataChanged({ company: null });
        }
    }, [displayMatchedCompanies, formData.company, isLoading]);

    const handleCloseSearchDetail = () => {
        resetHyperlinkType?.();
    };

    const searchValidation = (searchValue: any) => {
        if (searchValue?.length === 1 && isNaN(searchValue)) {
            growl.warning('CRM.NETSUITE.SEARCH_WARNING');
            return false;
        }

        return true;
    };

    return (
        <CRMLogForm
            disabled={disabled}
            isLoading={isLoading}
            onFormDataChanged={handleFormDataChanged}
            formData={formData}
        >
            <CRMSubjectField value={formData.subject} />
            <CRMMatchField
                label={t('CRM.NETSUITE.COMPANY')}
                placeholder={defaultCompanyWhenNotSelect}
                searchType='COMPANY'
                formDataKey='company'
                autoPopSearchDetail={!!hyperlinkType}
                selectedItems={selectedCompany}
                matchedItems={displayMatchedCompanies}
                platFormTranslateKey='NETSUITE'
                createFields={createFields}
                iconCreator={iconCreator}
                onCreateRecord={handleCreateRecord}
                onCloseSearchDetail={handleCloseSearchDetail}
                searchValidation={searchValidation}
                engageType={engageType}
                engageInfo={engageInfo}
                reloadMatchedList={reloadMatchedList}
            />
            {formData.company?.id && (
                <Fragment>
                    <NetSuiteLinkedRecord
                        type={RecordType.CONTACT}
                        formDataKey={LinkedRecordType.CONTACT}
                        handleCreateRecord={handleCreateRecord}
                        selectedItem={selectedContact}
                    />
                    <NetSuiteLinkedRecord
                        type={RecordType.SUPPORTCASE}
                        formDataKey={LinkedRecordType.SUPPORTCASE}
                        handleCreateRecord={handleCreateRecord}
                        selectedItem={selectedSupportCase}
                    />
                    <NetSuiteLinkedRecord
                        type={RecordType.TRANSACTION}
                        formDataKey={LinkedRecordType.TRANSACTION}
                        createType={RecordType.OPPORTUNITY}
                        handleCreateRecord={handleCreateRecord}
                        selectedItem={selectedTransaction}
                    />
                </Fragment>
            )}
        </CRMLogForm>
    );
};
