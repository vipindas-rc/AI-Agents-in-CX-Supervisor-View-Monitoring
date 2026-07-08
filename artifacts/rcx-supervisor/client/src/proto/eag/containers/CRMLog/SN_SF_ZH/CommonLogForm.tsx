import { type FC, useMemo, useEffect, useRef } from 'react';

import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';

import { NAME_FIELD_OBJ, RELATED_FIELD_OBJ, LOG_INFO_KEY } from './constants';
import { useEngageInfoChanged } from './hooks/useEngageInfoChanged';
import { useIconCreator } from './hooks/useIconCreator';
import { useSetRelatedDisabled } from './hooks/useSetRelatedDisabled';
import type { ICommonLogFormProps, FormData } from './types';
import { useAngularModule } from '../../../components/CRM/Hooks/useAngularModule';
import { useCreateFields } from '../../../components/CRM/Hooks/useCreateFields';
import { useDataTracking } from '../../../components/CRM/Hooks/useDataTracking';
import {
    CRMLogForm,
    CRMMatchField,
    CRMSubjectField,
} from '../../../components/CRM/LogForm';
import type { CreateField } from '../../../components/CRM/types';
import type { CRMPlatform } from '../../../constants/crm';
import {
    CRM_NAME_MATCHED_LABEL,
    CRM_RELATED_TO_MATCHED_LABEL,
    CRM_SELECT_NAME,
    CRM_SELECT_RELATED_TO,
} from '../../../constants/testIds';

export const CommonLogForm: FC<ICommonLogFormProps> = ({
    disabled,
    engageInfo,
    formData,
    nameItems = [],
    customNameFields,
    relatedToItems = [],
    customRelatedToFields,
    hyperlinkType,
    onFormDataChanged,
    onEngageInfoChanged,
    resetHyperlinkType,
    platform,
    engageType,
    isLoading,
    reloadMatchedList,
}) => {
    const { isRelatedToDisabled } = useSetRelatedDisabled(formData, platform);

    const formDataRef = useRef<FormData | null>(null);
    const CrmSvc = useAngularModule('CrmSvc');
    const { t } = useTranslation();
    const platFormTranslateKey = useMemo(() => {
        return platform.toUpperCase();
    }, [platform]);

    useDataTracking({
        isMatched: !isLoading,
        eventMatchedItems: relatedToItems,
        peopleMatchedItems: nameItems,
    });

    const defaultNameWhenNotSelect = useMemo(() => {
        return nameItems.length
            ? t(`CRM.${platFormTranslateKey}.SELECT_NAME`)
            : t(`CRM.${platFormTranslateKey}.CREATE_NAME`);
    }, [nameItems, platFormTranslateKey]);

    const defaultRelatedWhenNotSelect = useMemo(() => {
        return relatedToItems.length
            ? t(`CRM.${platFormTranslateKey}.SEARCH_RELATED_TO`)
            : t(`CRM.${platFormTranslateKey}.CREATE_RELATED_TO`);
    }, [relatedToItems, platFormTranslateKey]);

    // init name fields config
    const nameFieldsConfig = customNameFields
        ? customNameFields
        : (NAME_FIELD_OBJ[
              platform as keyof typeof NAME_FIELD_OBJ
          ] as unknown as CreateField[]);

    const { createFields: createNameFields, handleCreateRecord } =
        useCreateFields(nameFieldsConfig, engageInfo);

    // init related to fields config
    const relatedToFieldsConfig = customRelatedToFields
        ? customRelatedToFields
        : (RELATED_FIELD_OBJ[
              platform as keyof typeof RELATED_FIELD_OBJ
          ] as unknown as CreateField[]);
    const { createFields: createRelatedFields } = useCreateFields(
        relatedToFieldsConfig,
        engageInfo
    );

    const iconCreator = useIconCreator(platform as CRMPlatform);

    useEngageInfoChanged(
        engageInfo,
        formData,
        nameItems,
        relatedToItems,
        onEngageInfoChanged
    );

    const handleFormDataChanged = (val: any) => {
        const nameVal = val.name;
        const relatedToVal = val.relatedTo;
        let name = formData.name;
        let relatedTo = formData.relatedTo;
        if (nameVal) {
            if (Array.isArray(nameVal)) {
                name = {
                    id: nameVal[0]?.id || '',
                    name: nameVal[0]?.name || '',
                    type: nameVal[0]?.type || '',
                    url: nameVal[0]?.url || '',
                    isSearchedResult: nameVal[0]?.isSearchedResult,
                };
            } else {
                name = nameVal;
            }
        }
        if (relatedToVal) {
            if (Array.isArray(relatedToVal)) {
                relatedTo = {
                    id: relatedToVal[0]?.id || '',
                    name: relatedToVal[0]?.name || '',
                    type: relatedToVal[0]?.type || '',
                    url: relatedToVal[0]?.url || '',
                    customerId: relatedToVal[0]?.customerId || '',
                    accountId: relatedToVal[0]?.accountId || '',
                    contactId: relatedToVal[0]?.contactId || '',
                };
            } else {
                relatedTo = relatedToVal;
            }
        }
        const newFormData = {
            ...formData,
            ...val,
            name,
            relatedTo,
        };
        onFormDataChanged(newFormData);
    };

    useEffect(
        debounce(() => {
            if (
                engageInfo.uii &&
                JSON.stringify(formDataRef.current) !== JSON.stringify(formData)
            ) {
                CrmSvc.submitCallLogWithCallback({
                    type: engageType,
                    uii: engageInfo.uii,
                    [LOG_INFO_KEY[platform]]: {
                        ...formData,
                        displayName:
                            formData?.name?.name || formData?.relatedTo?.name,
                    },
                });
                formDataRef.current = formData;
            }
        }, 500),
        [formData, engageInfo.uii]
    );

    const handleCloseSearchDetail = () => {
        resetHyperlinkType?.();
    };

    const clickToDialName = useMemo(() => {
        return nameItems.find((item) => item.isCurrent);
    }, [nameItems]);

    const clickToDialRelatedTo = useMemo(() => {
        return relatedToItems.find((item) => item.isCurrent);
    }, [relatedToItems]);

    const selectedName = useMemo(() => {
        const defaultName =
            typeof formData.name !== 'undefined'
                ? formData.name.id !== ''
                    ? formData.name
                    : null
                : clickToDialName;
        return defaultName ? [defaultName] : [];
    }, [formData.name, clickToDialName]);

    const selectedRelatedTo = useMemo(() => {
        const defaultRelatedTo =
            typeof formData.relatedTo !== 'undefined'
                ? formData.relatedTo.id !== ''
                    ? formData.relatedTo
                    : null
                : clickToDialRelatedTo;
        return defaultRelatedTo ? [defaultRelatedTo] : [];
    }, [formData.relatedTo, clickToDialRelatedTo]);

    useEffect(() => {
        onFormDataChanged(formData);
        if ((!formData.name || !formData.relatedTo) && !isLoading) {
            let name;
            if (clickToDialName) {
                name = clickToDialName;
            } else if (nameItems.length === 1) {
                name = nameItems[0];
            } else {
                name = null;
            }

            let relatedTo;
            if (clickToDialRelatedTo) {
                relatedTo = clickToDialRelatedTo;
            } else if (relatedToItems.length === 1) {
                relatedTo = relatedToItems[0];
            } else {
                relatedTo = null;
            }

            onFormDataChanged({
                ...formData,
                name: {
                    id: name?.id || '',
                    name: name?.name || '',
                    type: name?.type || '',
                    url: name?.url || '',
                    isSearchedResult: name?.isSearchedResult,
                },
                relatedTo: {
                    id: relatedTo?.id || '',
                    name: relatedTo?.name || '',
                    type: relatedTo?.type || '',
                    url: relatedTo?.url || '',
                    customerId: relatedTo?.customerId || '',
                    accountId: relatedTo?.accountId || '',
                    contactId: relatedTo?.contactId || '',
                },
            });
        }
    }, [
        nameItems,
        relatedToItems,
        formData.relatedTo,
        formData.name,
        clickToDialName,
        clickToDialRelatedTo,
        isLoading,
    ]);

    return (
        <CRMLogForm
            disabled={disabled}
            onFormDataChanged={handleFormDataChanged}
            formData={formData}
        >
            <CRMSubjectField value={formData.subject} />
            {createNameFields?.length > 0 && (
                <CRMMatchField
                    label={t(`CRM.${platFormTranslateKey}.NAME`)}
                    placeholder={defaultNameWhenNotSelect}
                    searchType='name'
                    formDataKey='name'
                    autoPopSearchDetail={hyperlinkType === 'name'}
                    selectedItems={selectedName}
                    matchedItems={nameItems}
                    platFormTranslateKey={platFormTranslateKey}
                    createFields={createNameFields}
                    iconCreator={iconCreator}
                    onCreateRecord={handleCreateRecord}
                    onCloseSearchDetail={handleCloseSearchDetail}
                    tipAid={CRM_NAME_MATCHED_LABEL}
                    fieldAid={CRM_SELECT_NAME}
                    engageType={engageType}
                    engageInfo={engageInfo}
                    reloadMatchedList={reloadMatchedList}
                />
            )}
            {createRelatedFields?.length > 0 && (
                <CRMMatchField
                    disabled={isRelatedToDisabled}
                    label={t(`CRM.${platFormTranslateKey}.RELATED_TO`)}
                    placeholder={defaultRelatedWhenNotSelect}
                    searchType='related'
                    formDataKey='relatedTo'
                    autoPopSearchDetail={hyperlinkType === 'relatedTo'}
                    selectedItems={selectedRelatedTo}
                    matchedItems={relatedToItems}
                    platFormTranslateKey={platFormTranslateKey}
                    createFields={createRelatedFields}
                    iconCreator={iconCreator}
                    onCreateRecord={handleCreateRecord}
                    onCloseSearchDetail={handleCloseSearchDetail}
                    tipAid={CRM_RELATED_TO_MATCHED_LABEL}
                    fieldAid={CRM_SELECT_RELATED_TO}
                    engageType={engageType}
                    engageInfo={engageInfo}
                    reloadMatchedList={reloadMatchedList}
                />
            )}
        </CRMLogForm>
    );
};
