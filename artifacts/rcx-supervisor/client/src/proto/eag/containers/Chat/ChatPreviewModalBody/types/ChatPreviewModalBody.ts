import type { DigitalTask } from '../../types/DigitalTask';
import type { WebChat } from '../../types/WebChat';

export interface IChatPreviewModalBody {
    task: DigitalTask | null;
}

export interface ILegacyChatPreviewModalBody {
    chat: WebChat | null;
}
