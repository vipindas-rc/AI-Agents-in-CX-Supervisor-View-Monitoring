import type { DateTime } from '@ringcx/shared';

import type { Message } from './Message';
import type { FreshdeskCallLogInfo } from '../../CRMLog/Freshdesk/types';
import type {
    IChatSourceColor,
    IChatType,
} from '../ChatList/components/ChatCard/types/ChatCard';

export interface CustomerIdentity {
    email?: string;
    homePhone?: string;
    mobilePhone?: string;
}

export interface SegmentContext {
    customerIdentity?: CustomerIdentity;
    segmentId?: string;
    dialog?: {
        dialogId?: string;
    };
}

export interface PendingMessage {
    // added by agent sdk
    message: string;
    status: string;
    messageId: string;
    accountId: string;
    uii: string;
    agentId: string;
    channelType: IChatType;
    sourceColor: IChatSourceColor;
    chatQueueId: string;
    chatQueueName: string;
    allowAccept: boolean;
    ani?: string;
    pendingAccept?: boolean;
    taskId: string;

    // added by engage digital Iframe callback
    waitingForUser?: boolean;

    // added by agent ui
    lastMsgDts: DateTime.Instance;
    pending: boolean;
    acceptPromise?: Promise<boolean>;
    agentMessage: string;
    edThreadTitle?: string;
    transcript: Array<Message>;

    pendingTimeout?: number; // timeout id to pop after 15 sec
    edUuid?: string;
    freshdeskLogInfo?: FreshdeskCallLogInfo;
    segmentContext?: SegmentContext;
    screenRecordingSettings?: {
        recordAcw: boolean;
        recordAgentsScreen: boolean;
    };
}
