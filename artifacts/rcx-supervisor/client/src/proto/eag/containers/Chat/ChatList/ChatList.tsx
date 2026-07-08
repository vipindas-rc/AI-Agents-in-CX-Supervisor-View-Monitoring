import type { FC } from 'react';
import { Fragment } from 'react';

import { ChatGroup } from './components/ChatGroup';
import { GroupCard } from './components/GroupCard/GroupCard';
import type { IChatListContainer } from './types/ChatList';
import type { ChatServiceChats } from '../types/ChatSvcChatTypes';

export const ChatList: FC<IChatListContainer> = ({
    chatMap,
    selectedUii,
    openChat,
    agentEndChat,
    onAccept,
    onEditDisposition,
    onEnd,
    onReject,
    onTransfer,
    onDiscard,
    isInCRM,
    CrmSvc,
    notificationSvc,
    growl,
}) => {
    return (
        <Fragment>
            {Object.keys(chatMap).map((group) => (
                <ChatGroup {...{ title: group }} key={group}>
                    {chatMap[group].map((chat: ChatServiceChats) => (
                        <GroupCard
                            {...{
                                chat,
                                selectedUii,
                                openChat,
                                agentEndChat,
                                onAccept,
                                onEditDisposition,
                                onEnd,
                                onReject,
                                onTransfer,
                                onDiscard,
                                isInCRM,
                                CrmSvc,
                                notificationSvc,
                                growl,
                            }}
                            key={chat.uii}
                        />
                    ))}
                </ChatGroup>
            ))}
        </Fragment>
    );
};
