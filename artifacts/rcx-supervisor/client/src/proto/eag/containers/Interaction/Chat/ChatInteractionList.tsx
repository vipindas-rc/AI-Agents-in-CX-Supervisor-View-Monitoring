import { Fragment, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { ChatInteractionCardContainer } from './ChatInteractionCardContainer';
import { MissedMessageCard } from './components/MissedMessageCard';
import { CHAT_GROUP_TITLE } from '../../../constants/testIds';
import type { IChatList } from '../../../layout/Chat/ChatList/types/ChatList';
import { useChatCallbacks } from '../../../layout/Chat/ChatList/useChatCallbacks';

export type ChatInteractionListProps = IChatList;

export const ChatInteractionList: FC<IChatList> = ({
    chats,
    selectedUii,
    chatSvc,
    isInCRM,
    crmSvc,
    notificationSvc,
    growl,
}) => {
    const { t } = useTranslation();
    const chatCallbacks = useChatCallbacks({
        chatSvc,
        isInCRM,
        crmSvc,
        notificationSvc,
    });

    return (
        <Fragment>
            <h2
                className='typography-descriptorMiniSemiBold m-0 text-[12px] [&:not(:has(+[data-interaction-card]))]:hidden'
                data-aid={CHAT_GROUP_TITLE}
            >
                {t('PHONE.FLYOVER.TAB_MESSAGES')}
            </h2>
            <MissedMessageCard chatSvc={chatSvc} />
            {[...chats].reverse().map((chat) => (
                <ChatInteractionCardContainer
                    key={chat.uii}
                    chat={chat}
                    selectedUii={selectedUii}
                    isInCRM={isInCRM}
                    CrmSvc={crmSvc}
                    growl={growl}
                    notificationSvc={notificationSvc}
                    {...chatCallbacks}
                />
            ))}
        </Fragment>
    );
};
