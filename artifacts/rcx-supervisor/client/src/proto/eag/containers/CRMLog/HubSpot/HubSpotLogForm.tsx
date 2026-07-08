import { useContext, useEffect, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { useEngageInfoChanged } from './hooks/useEngageInfoChanged';
import { useIconCreator } from './hooks/useIconCreator';
import { OutcomeField } from './OutcomeField';
import type { IHubSpotLogFormData, IHubSpotLogFormProps } from './types';
import { DataTrackingEventNames } from '../../../components/CRM/constants';
import { useAngularModule } from '../../../components/CRM/Hooks/useAngularModule';
import { useCreateFields } from '../../../components/CRM/Hooks/useCreateFields';
import { useDataTracking } from '../../../components/CRM/Hooks/useDataTracking';
import { CRMLogForm, CRMMatchField } from '../../../components/CRM/LogForm';
import { CRMSubjectField } from '../../../components/CRM/LogForm/CRMSubjectField';
import { LogKindContext } from '../../../helpers/logKind';

export const HubSpotLogForm: FC<IHubSpotLogFormProps> = ({
    disabled,
    isLoading,
    engageType,
    engageInfo,
    formData,
    matchedAssociations = [],
    outcomeList,
    hyperlinkType,
    onFormDataChanged,
    onEngageInfoChanged,
    resetHyperlinkType,
    typeGroups,
    reloadMatchedList,
}) => {
    const { t } = useTranslation();
    const CrmSvc = useAngularModule('CrmSvc');
    const fields = typeGroups?.types || [];
    const { createFields, handleCreateRecord } = useCreateFields(
        fields,
        engageInfo
    );
    const iconCreator = useIconCreator();
    const logKind = useContext(LogKindContext);
    const AnalyticsSvc = useAngularModule('AnalyticsSvc');

    useDataTracking({
        isMatched: !isLoading,
        eventMatchedItems: matchedAssociations!,
    });

    useEngageInfoChanged(
        formData.associations,
        matchedAssociations,
        onEngageInfoChanged
    );

    const handleFormDataChanged = (val: Partial<IHubSpotLogFormData>) => {
        const displayName =
            (val.associations
                ? val.associations[0]?.name
                : formData.displayName) || '';
        const newFormData = {
            ...formData,
            ...val,
            displayName,
        };
        onFormDataChanged(newFormData);
    };

    useEffect(() => {
        if (engageInfo.uii) {
            CrmSvc.submitCallLogWithCallback({
                type: engageType,
                uii: engageInfo.uii,
                hubSpotLogInfo: formData,
            });
        }
    }, [formData, engageInfo.uii]);

    useEffect(() => {
        // Only automatically single match when no hubSpotLogInfo
        if (matchedAssociations.length === 1 && !formData.associations) {
            handleFormDataChanged({ associations: [...matchedAssociations] });
        } else if (!isLoading && formData.associations === undefined) {
            handleFormDataChanged({ associations: [] });
        }
    }, [matchedAssociations, formData.associations]);

    const handleCloseSearchDetail = () => {
        resetHyperlinkType?.();
        const selectedAssociations = formData.associations;
        if (selectedAssociations?.length) {
            AnalyticsSvc.track(DataTrackingEventNames.RCXSearchSelect, {
                method: logKind?.logKindType,
                number: selectedAssociations.length,
                type: selectedAssociations.map((item) => item.type),
            });
        }
    };

    return (
        <CRMLogForm
            disabled={disabled}
            isLoading={isLoading}
            onFormDataChanged={handleFormDataChanged}
            formData={formData}
        >
            <CRMSubjectField value={formData.subject} />
            {outcomeList && <OutcomeField outcomeList={outcomeList} />}
            <CRMMatchField
                label={t('CRM.HUBSPOT.ASSOCIATIONS')}
                placeholder={t('CRM.HUBSPOT.ASSOCIATIONS_SELECT_PLACEHOLDER')}
                searchType='RELATED_TO'
                formDataKey='associations'
                autoPopSearchDetail={!!hyperlinkType}
                selectedItems={formData.associations}
                matchedItems={matchedAssociations}
                platFormTranslateKey='HUBSPOT'
                createFields={createFields}
                iconCreator={iconCreator}
                onCreateRecord={handleCreateRecord}
                onCloseSearchDetail={handleCloseSearchDetail}
                engageType={engageType}
                isShowSelectedItemsNumber
                engageInfo={engageInfo}
                reloadMatchedList={reloadMatchedList}
            />
        </CRMLogForm>
    );
};
