import { useCallback, useMemo, type FC } from 'react';

import { CommonLogForm } from './CommonLogForm';
import { useFormData } from './hooks/useFormData';
import { useUpdateMatchRecords } from './hooks/useUpdateMatchRecords';
import type { CommonCallLogContainerProps, FormData } from './types';
import { useRenderAgentAssist } from '../../../components/CRM/Hooks/useRenderAgentAssist';
import { useRenderScript } from '../../../components/CRM/Hooks/useRenderScript';
import { useCallLogSubject } from '../../../components/CRM/Hooks/useSubject';
import { CRMCallTypes, CRMPlatform, SourceType } from '../../../constants/crm';

export const CommonCallLogContainer: FC<CommonCallLogContainerProps> = ({
    engageInfo: currentCall,
    disabled,
    hyperlinkType,
    initialFormData,
    onFormDataChanged,
    onEngageInfoChanged,
    resetHyperlinkType,
    platform,
    sourceType,
    isMatched,
    matchedNameItems,
    matchedRelatedToItems,
    engageType,
    usePopRecords,
    shouldPopRecordWhenMatched = false,
    shouldCreateRecordWhenNoMatch = false,
    shouldPopRecordMoreThanOnce = false,
    customNameFields,
    customRelatedToFields,
    reloadMatchedList,
}) => {
    const { ani, aniE164, callType, uii } = currentCall;
    const phoneNumber = aniE164 || ani;
    const isInbound = callType === CRMCallTypes.Inbound;
    const defaultSubject = useCallLogSubject(phoneNumber, isInbound);
    const { formData, setFormData } = useFormData(
        defaultSubject,
        initialFormData
    );

    const handleFormDataChanged = (formData: FormData) => {
        if (disabled) {
            return;
        }
        setFormData(formData);
        onFormDataChanged?.(formData);
    };

    const {
        updatedMatchedNameItems,
        updatedMatchedRelatedToItems,
        isRecordUpdated,
        resetIsRecordUpdated,
    } = useUpdateMatchRecords(
        uii,
        platform,
        formData,
        sourceType === SourceType.CALL_PAGE,
        handleFormDataChanged
    );

    const nameItems = useMemo(() => {
        return isRecordUpdated ? updatedMatchedNameItems : matchedNameItems;
    }, [updatedMatchedNameItems, matchedNameItems, isRecordUpdated]);

    const relatedToItems = useMemo(() => {
        return isRecordUpdated
            ? updatedMatchedRelatedToItems
            : matchedRelatedToItems;
    }, [updatedMatchedRelatedToItems, matchedRelatedToItems, isRecordUpdated]);

    const handleReloadMatchedList = useCallback(() => {
        resetIsRecordUpdated();
        reloadMatchedList?.();
    }, [resetIsRecordUpdated, reloadMatchedList]);

    usePopRecords?.({
        currentCall,
        isMatched,
        matchedNameItems: nameItems,
        matchedRelatedToItems: relatedToItems,
        shouldPopRecordWhenMatched,
        shouldCreateRecordWhenNoMatch,
        shouldPopRecordMoreThanOnce,
    });

    useRenderScript(currentCall, isMatched, platform);
    useRenderAgentAssist(currentCall, true);
    return (
        <CommonLogForm
            disabled={disabled}
            formData={formData}
            isLoading={!isMatched}
            nameItems={nameItems}
            relatedToItems={relatedToItems}
            hyperlinkType={hyperlinkType}
            engageType={engageType}
            engageInfo={currentCall}
            onFormDataChanged={handleFormDataChanged}
            onEngageInfoChanged={onEngageInfoChanged}
            resetHyperlinkType={resetHyperlinkType}
            platform={platform}
            customNameFields={customNameFields}
            customRelatedToFields={customRelatedToFields}
            reloadMatchedList={handleReloadMatchedList}
        />
    );
};
