import type { Baggage } from './Baggage';
import type { BaseChatInteraction } from './BaseChatInteraction';
import type { Disposition } from './Disposition';
import type { PendingMessage } from './PendingMessage';
import type { RequeueShortcut } from './RequeueShortcut';
import type {
    IChatSourceColor,
    IChatType,
} from '../ChatList/components/ChatCard/types/ChatCard';

export interface DigitalTask extends BaseChatInteraction, PendingMessage {
    requeueShortcuts: Array<RequeueShortcut>;
    chatDispositions: Array<Disposition>;
    baggage: Baggage;

    edCreatedAt: string;
    edLanguage?: string;
    edCategories?: string[];
    edSourceName?: string;
    edAuthorScreenName: string;
    identityName?: string;
    channelType: IChatType;
    sourceColor: IChatSourceColor;
    chatState: string;
    isOutbound: boolean;
    isDraft: boolean;
}
