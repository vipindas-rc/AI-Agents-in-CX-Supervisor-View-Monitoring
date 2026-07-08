import type { ChatServiceChats } from '../../../../types/ChatSvcChatTypes';
import type { IChatCallbacks } from '../../../types/ChatList';
import type { IChatCard } from '../../ChatCard/types/ChatCard';

export interface IGroupCard extends IChatCallbacks {
    chat: ChatServiceChats;
    selectedUii: string;
    isInCRM: boolean;
    CrmSvc: any;
    notificationSvc: any;
    growl: any;
    renderCard?: (props: IChatCard) => React.ReactNode;
}
