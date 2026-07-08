import { useCallback, useMemo, type FC } from 'react';

import { useFormData } from './hooks/useFormData';
import { useHubSpotMatchRecords } from './hooks/useHubSpotMatchRecords';
import { useUpdateHubSpotMatchRecords } from './hooks/useUpdateHubSpotMatchRecords';
import { HubSpotLogForm } from './HubSpotLogForm';
import type {
    HubSpotCallLogContainerProps,
    IHubSpotLogFormData,
} from './types';
import { useRenderAgentAssist } from '../../../components/CRM/Hooks/useRenderAgentAssist';
import { useRenderScript } from '../../../components/CRM/Hooks/useRenderScript';
import { useCallLogSubject } from '../../../components/CRM/Hooks/useSubject';
import { CRMCallTypes, ParamsType, SourceType } from '../../../constants/crm';

export const HubSpotCallLogContainer: FC<HubSpotCallLogContainerProps> = ({
    engageInfo: currentCall,
    disabled,
    hyperlinkType,
    initialFormData,
    onFormDataChanged,
    onEngageInfoChanged,
    resetHyperlinkType,
    sourceType,
}) => {
    const { ani, aniE164, callType } = currentCall;
    const phoneNumber = aniE164 || ani;
    const isInbound = callType === CRMCallTypes.Inbound;
    const defaultSubject = useCallLogSubject(phoneNumber, isInbound);
    const { formData, setFormData } = useFormData(
        defaultSubject,
        initialFormData
    );

    const {
        isMatched,
        outcomeList,
        matchedItems,
        typeGroups,
        reloadMatchedList,
    } = useHubSpotMatchRecords(ParamsType.Call, currentCall);

    useRenderScript(currentCall);
    useRenderAgentAssist(currentCall, true);

    const handleFormDataChanged = (formData: IHubSpotLogFormData) => {
        if (disabled) {
            return;
        }
        setFormData(formData);
        onFormDataChanged?.(formData);
    };

    const {
        updatedMatchedAssociations,
        isRecordUpdated,
        resetIsRecordUpdated,
    } = useUpdateHubSpotMatchRecords(
        currentCall.uii || '',
        formData,
        sourceType === SourceType.CALL_PAGE,
        handleFormDataChanged
    );

    const currentMatchedAssociations = useMemo(
        () =>
            isRecordUpdated ? updatedMatchedAssociations : matchedItems || [],
        [isRecordUpdated, matchedItems, updatedMatchedAssociations]
    );

    const handleReloadMatchedList = useCallback(() => {
        resetIsRecordUpdated();
        reloadMatchedList?.();
    }, [reloadMatchedList, resetIsRecordUpdated]);

    return (
        <HubSpotLogForm
            typeGroups={typeGroups}
            disabled={disabled}
            formData={formData}
            isLoading={!isMatched}
            matchedAssociations={currentMatchedAssociations}
            hyperlinkType={hyperlinkType}
            outcomeList={outcomeList}
            engageType={ParamsType.Call}
            engageInfo={currentCall}
            onFormDataChanged={handleFormDataChanged}
            onEngageInfoChanged={onEngageInfoChanged}
            resetHyperlinkType={resetHyperlinkType}
            reloadMatchedList={handleReloadMatchedList}
        />
    );
};
