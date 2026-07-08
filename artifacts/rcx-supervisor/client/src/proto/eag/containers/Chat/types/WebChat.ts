import type { Baggage } from './Baggage';
import type { BaseChatInteraction } from './BaseChatInteraction';
import type { Disposition } from './Disposition';
import type { Message } from './Message';
import type { PendingMessage } from './PendingMessage';
import type { RequeueShortcut } from './RequeueShortcut';
import type {
    IChatSourceColor,
    IChatType,
} from '../ChatList/components/ChatCard/types/ChatCard';

interface ChatBaggage extends Baggage {
    ani: string;
    dnis: string;
}

export interface WebChat extends BaseChatInteraction, PendingMessage {
    appUrl: string;
    ani: string;
    dnis: string;
    surveyPopType: string;
    scriptId: string;
    scriptVersion: string;
    isMonitoring: string;
    monitoredAgentId: string;
    preChatData: {
        [key: string]: string;
    };

    pendingAgentMessage?: string;
    defaultDisp?: Disposition;

    requeueShortcuts?: Array<RequeueShortcut>;
    chatDispositions: Array<Disposition>;
    transcript: Array<Message>;
    baggage: ChatBaggage;
    channelType: IChatType;
    sourceColor: IChatSourceColor;
}
