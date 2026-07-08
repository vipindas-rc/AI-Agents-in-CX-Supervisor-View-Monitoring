import type { ChatServiceChats } from '../../types/ChatSvcChatTypes';
import type { DigitalTask } from '../../types/DigitalTask';
import type { PendingMessage } from '../../types/PendingMessage';
import type { WebChat } from '../../types/WebChat';

export interface IChatCallbacks {
    onAccept(chat: PendingMessage): void;
    onReject(chat: PendingMessage): void;
    onEditDisposition(chat: WebChat): void;
    onEnd(chat: WebChat | DigitalTask): void;
    onTransfer(chat: WebChat | DigitalTask): void;
    onDiscard(chat: WebChat | DigitalTask): void;
    openChat(chat: ChatServiceChats): void;
    agentEndChat(chat: ChatServiceChats): void;
}

export interface IChatListContainer extends IChatCallbacks {
    chatMap: { [queueName: string]: Array<ChatServiceChats> };
    selectedUii: string;
    isInCRM: boolean;
    CrmSvc: any;
    notificationSvc: any;
    growl: any;
}
