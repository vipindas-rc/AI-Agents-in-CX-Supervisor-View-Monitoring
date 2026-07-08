import type { DateTime } from '@ringcx/shared';

export interface BaseChatInteraction {
    message: string;
    status: string;
    uii: string;
    accountId: string;
    sessionId: string;
    agentId: string;
    queueDts: DateTime.Instance;
    queueTime: string;
    chatQueueId: string;
    chatQueueName: string;
    chatRequeueType: string;
    idleTimeout: string;
    taskId: string; // '' is possible
    pendingDisp?: boolean;
    inactive?: boolean;
}
