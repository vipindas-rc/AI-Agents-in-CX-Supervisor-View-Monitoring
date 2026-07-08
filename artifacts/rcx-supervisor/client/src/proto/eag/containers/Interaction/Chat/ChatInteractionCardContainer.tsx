import type { FC } from 'react';

import { ChatInteractionCard } from './ChatInteractionCard';
import type { IChatCard } from '../../Chat/ChatList/components/ChatCard/types/ChatCard';
import { GroupCard as ChatCard } from '../../Chat/ChatList/components/GroupCard/GroupCard';
import type { IGroupCard } from '../../Chat/ChatList/components/GroupCard/types/GroupCard';

type ChatInteractionCardContainerProps = Omit<IGroupCard, 'renderCard'>;

export const ChatInteractionCardContainer: FC<
    ChatInteractionCardContainerProps
> = ({ chat, ...props }) => {
    const lastMessage = chat.transcript.at(-1)?.message ?? '';

    const renderCard = (cardProps: IChatCard) => {
        return (
            <ChatInteractionCard
                {...cardProps}
                message={lastMessage}
                queueName={chat.chatQueueName}
            />
        );
    };

    return <ChatCard chat={chat} renderCard={renderCard} {...props} />;
};
