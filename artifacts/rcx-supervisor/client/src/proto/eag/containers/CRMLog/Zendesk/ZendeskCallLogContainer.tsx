import { useCallback, useRef, type FC } from 'react';

import { useFormData } from './hooks/useFormData';
import { useZendeskMatchRecords } from './hooks/useZendeskMatchRecords';
import { useZendeskPopRecords } from './hooks/useZendeskPopRecords';
import { useZendeskUpdateMatchRecords } from './hooks/useZendeskUpdateMatchRecords';
import type { ZendeskLogContainerProps, IZendeskLogFormData } from './types';
import { ZendeskLogForm } from './ZendeskLogForm';
import { useRenderAgentAssist } from '../../../components/CRM/Hooks/useRenderAgentAssist';
import { useRenderScript } from '../../../components/CRM/Hooks/useRenderScript';
import { useCallLogSubject } from '../../../components/CRM/Hooks/useSubject';
import type { MatchItem } from '../../../components/CRM/types';
import {
    CRMCallTypes,
    CRMPlatform,
    ParamsType,
    SourceType,
} from '../../../constants/crm';

export const ZendeskCallLogContainer: FC<ZendeskLogContainerProps> = ({
    disabled = false,
    engageInfo,
    onEngageInfoChanged,
    shouldCreateRecordWhenNoMatch = false,
    shouldPopRecordWhenMatched = true,
    shouldPopRecordMoreThanOnce = false,
    resetHyperlinkType = () => {},
    hyperlinkType,
    selectSize,
    onFormDataChanged,
    initialFormData,
    sourceType,
}) => {
    const { ani, aniE164, callType } = engageInfo;
    const phoneNumber = aniE164 || ani;
    const isInbound = callType === CRMCallTypes.Inbound;
    const defaultSubject = useCallLogSubject(phoneNumber, isInbound);
    const { formData, setFormData } = useFormData(
        defaultSubject,
        initialFormData
    );
    const formDataRef = useRef(formData);
    formDataRef.current = formData;

    const { isMatched, matchedUsers } = useZendeskMatchRecords(
        ParamsType.Call,
        engageInfo,
        disabled
    );

    const handleFormDataChanged = useCallback(
        (formData: IZendeskLogFormData) => {
            if (disabled) {
                return;
            }
            setFormData(formData);
            onFormDataChanged?.(formData);
        },
        [disabled, onFormDataChanged, setFormData]
    );

    const afterCreateUser = useCallback(
        (user: MatchItem) => {
            handleFormDataChanged({ ...formDataRef.current, user });
        },
        [handleFormDataChanged]
    );

    const shouldEnableUpdateMatchRecords =
        !disabled && sourceType === SourceType.CALL_PAGE;
    // Handle UPDATE_MATCHING_RECORDS message to update matchedUsers
    const { updatedMatchedUsers, updatedTicket, isRecordUpdated } =
        useZendeskUpdateMatchRecords(
            engageInfo.uii,
            formData,
            shouldEnableUpdateMatchRecords,
            handleFormDataChanged
        );

    const shouldUseUpdatedMatchedUsers =
        isRecordUpdated && updatedMatchedUsers.length > 0;
    const finalMatchedUsers = shouldUseUpdatedMatchedUsers
        ? updatedMatchedUsers
        : matchedUsers;
    const selectedTicket = isRecordUpdated ? updatedTicket : undefined;

    useZendeskPopRecords({
        disabled,
        isMatched,
        engageInfo,
        matchedUsers: finalMatchedUsers,
        afterCreateUser,
        shouldPopRecordWhenMatched,
        shouldCreateRecordWhenNoMatch,
        shouldPopRecordMoreThanOnce,
    });

    useRenderScript(engageInfo, isMatched, CRMPlatform.Zendesk);
    useRenderAgentAssist(engageInfo, true);
    return (
        <ZendeskLogForm
            disabled={disabled}
            matchedUsers={finalMatchedUsers}
            selectedTicket={selectedTicket}
            hyperlinkType={hyperlinkType}
            selectSize={selectSize}
            resetHyperlinkType={resetHyperlinkType}
            onEngageInfoChanged={onEngageInfoChanged}
            formData={formData}
            onFormDataChanged={handleFormDataChanged}
            isLoading={!isMatched}
            engageInfo={engageInfo}
            engageType={ParamsType.Call}
        />
    );
};
