import type { DigitalTask } from './DigitalTask';
import type { PendingMessage } from './PendingMessage';
import type { WebChat } from './WebChat';

export type ChatServiceChats = PendingMessage | WebChat | DigitalTask;

export function isPendingMessage(
    chat: ChatServiceChats
): chat is PendingMessage {
    return !!(chat as PendingMessage).pending;
}

export function isWebChat(chat: ChatServiceChats): chat is WebChat {
    return !(chat as WebChat).taskId || (chat as WebChat).taskId.length === 0;
}

export function isDigitalTask(chat: ChatServiceChats): chat is DigitalTask {
    return (
        !!(chat as DigitalTask).taskId &&
        (chat as DigitalTask).taskId.length > 0 &&
        !(chat as DigitalTask).isDraft
    );
}

export function isOutboundDraftChat(
    chat: ChatServiceChats
): chat is DigitalTask {
    return (
        !!(chat as DigitalTask).taskId &&
        (chat as DigitalTask).taskId.length > 0 &&
        (chat as DigitalTask).isDraft &&
        (chat as DigitalTask).isOutbound
    );
}
