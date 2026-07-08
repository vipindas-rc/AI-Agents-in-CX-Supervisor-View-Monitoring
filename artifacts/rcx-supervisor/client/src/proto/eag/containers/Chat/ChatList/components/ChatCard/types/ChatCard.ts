import type { SyntheticEvent } from 'react';

import type { DateTime } from '@ringcx/shared';

import type { CRMPlatform } from '../../../../../../constants/crm';

export interface IChatCard {
    selected: boolean;
    threadTitle?: string;
    onClick?: () => void;
    title: string;
    queueName?: string;
    lastMsgDts: DateTime.Instance;
    channelType: IChatType;
    message?: string;
    pendingDisp?: boolean;
    pendingAccept?: boolean;
    waitingForUser?: boolean;
    acceptPromise?: Promise<boolean>;
    disabled: boolean;
    sourceColor: IChatSourceColor;
    uii: string;
    onAccept(event: SyntheticEvent): void;
    onReject(event: SyntheticEvent): void;
    onTransfer(event: SyntheticEvent): void;
    onEnd(event: SyntheticEvent): void;
    onEditDisposition(): void;
    onDiscard?(event: SyntheticEvent): void;
    isInCRM: boolean;
    openMessageLogModal: () => void;
    CrmSvc?: {
        edApiCall(taskId: string, arg1: string): any;
        messageLogViewedList: string[];
        setMessageLogViewedList: (list: string[]) => void;
        openRecord: (record: any) => void;
        integrateInfo: {
            platform: CRMPlatform;
        };
        canOpenRecord: () => boolean;
    };
    notificationSvc?: {
        showInfo: (message: string) => void;
    };
    crmMatchedInfos?: any;
    taskId: string;
    isDraft: boolean;
}

export type IChatType =
    | 'apple_business_chat'
    | 'chat'
    | 'default'
    | 'engage_messaging'
    | 'dimelo_sdk'
    | 'channel_sdk'
    | 'digital_sms'
    | 'email'
    | 'facebook'
    | 'google_business_messages'
    | 'google_my_business'
    | 'google_play'
    | 'instagram'
    | 'lithium'
    | 'messenger'
    | 'rightnow'
    | 'rss'
    | 'SMS'
    | 'twitter'
    | 'twitter_search'
    | 'tapatalk'
    | 'viber'
    | 'WEB_CHAT'
    | 'whats_app'
    | 'youtube'
    | 'linkedin'
    | 'unknown'
    | 'VOICE'
    | 'VOICE_OUTBOUND'
    | 'VOICE_INBOUND'
    | 'EMAIL';

// Numeric color values mapped to hex values in engage-ui
export type IChatSourceColor =
    | '0'
    | '1'
    | '2'
    | '3'
    | '4'
    | '5'
    | '6'
    | '7'
    | '8'
    | '9';
