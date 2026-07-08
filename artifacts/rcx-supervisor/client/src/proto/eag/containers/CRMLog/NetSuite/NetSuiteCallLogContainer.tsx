import type { FC } from 'react';
import { useCallback, useMemo } from 'react';

import { useFormData } from './hooks/useFormData';
import { useNetSuiteMatchRecords } from './hooks/useNetSuiteMatchRecords';
import { useUpdateMatchRecords } from './hooks/useUpdateMatchRecords';
import { NetSuiteLogForm } from './NetSuiteLogForm';
import type { NetSuiteCallLogContainerProps, FormData } from './types';
import { useRenderAgentAssist } from '../../../components/CRM/Hooks/useRenderAgentAssist';
import { useRenderScript } from '../../../components/CRM/Hooks/useRenderScript';
import { useCallLogSubject } from '../../../components/CRM/Hooks/useSubject';
import { CRMCallTypes, ParamsType, SourceType } from '../../../constants/crm';

export const NetSuiteCallLogContainer: FC<NetSuiteCallLogContainerProps> = ({
    engageInfo: currentCall,
    disabled,
    hyperlinkType,
    initialFormData,
    sourceType,
    onFormDataChanged,
    onEngageInfoChanged,
    resetHyperlinkType,
}) => {
    const { ani, aniE164, callType } = currentCall;
    const phoneNumber = aniE164 || ani;
    const isInbound = callType === CRMCallTypes.Inbound;
    const defaultSubject = useCallLogSubject(phoneNumber, isInbound);
    const { formData, setFormData } = useFormData(
        defaultSubject,
        initialFormData
    );

    const { isMatched, matchedItems, typeGroups, reloadMatchedList } =
        useNetSuiteMatchRecords(ParamsType.Call, currentCall);

    useRenderScript(currentCall);
    useRenderAgentAssist(currentCall, true);

    const handleFormDataChanged = (formData: FormData) => {
        setFormData(formData);
        onFormDataChanged?.(formData);
    };

    const isDisabled = disabled || sourceType !== SourceType.CALL_PAGE;

    const {
        updatedMatchedNameItems,
        updatedSelectedContactItem,
        updatedSelectedSupportCaseItem,
        updatedSelectedTransactionItem,
        isRecordUpdated,
        resetIsRecordUpdated,
    } = useUpdateMatchRecords(
        currentCall.uii,
        formData,
        isDisabled,
        typeGroups?.name || [],
        handleFormDataChanged
    );

    const handleReloadMatchedList = useCallback(() => {
        resetIsRecordUpdated();
        reloadMatchedList?.();
    }, [resetIsRecordUpdated, reloadMatchedList]);

    const companyItems = useMemo(() => {
        const items = isRecordUpdated ? updatedMatchedNameItems : matchedItems;
        return items.filter(
            (item) => item.type && typeGroups?.name?.includes(item.type)
        );
    }, [
        updatedMatchedNameItems,
        matchedItems,
        isRecordUpdated,
        typeGroups?.name,
    ]);

    const selectedContactItem = useMemo(() => {
        return isRecordUpdated ? updatedSelectedContactItem : null;
    }, [updatedSelectedContactItem, isRecordUpdated]);

    const selectedSupportCaseItem = useMemo(() => {
        return isRecordUpdated ? updatedSelectedSupportCaseItem : null;
    }, [updatedSelectedSupportCaseItem, isRecordUpdated]);

    const selectedTransactionItem = useMemo(() => {
        return isRecordUpdated ? updatedSelectedTransactionItem : null;
    }, [updatedSelectedTransactionItem, isRecordUpdated]);

    return (
        <NetSuiteLogForm
            fields={typeGroups?.types || []}
            disabled={disabled}
            formData={formData}
            isLoading={!isMatched}
            matchedCompanies={companyItems}
            hyperlinkType={hyperlinkType}
            engageType={ParamsType.Call}
            engageInfo={currentCall}
            onFormDataChanged={handleFormDataChanged}
            onEngageInfoChanged={onEngageInfoChanged}
            resetHyperlinkType={resetHyperlinkType}
            reloadMatchedList={handleReloadMatchedList}
            selectedContact={selectedContactItem}
            selectedSupportCase={selectedSupportCaseItem}
            selectedTransaction={selectedTransactionItem}
        />
    );
};
