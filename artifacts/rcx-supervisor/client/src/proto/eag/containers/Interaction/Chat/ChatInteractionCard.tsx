import { type FC } from 'react';

import { NotesMd } from '@ringcentral/spring-icon';
import { Badge, IconButton, Text } from '@ringcentral/spring-ui';
import { digitalColorMap } from '@ringcx/ui';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { InteractionCardWrapper } from '../InteractionCardWrapper';
import { ActiveChatActions } from './components/ActiveChatActions';
import { PendingAcceptActions } from './components/PendingAcceptActions';
import {
    CHAT_CARD,
    TIMER,
    INTERACTION_TYPE_ICON,
    CONTACT_NAME,
    QUEUE_NAME,
    CHAT_PREVIEW_MODAL,
    MESSAGE_CONTENT,
} from '../../../constants/testIds';
import { useFormattedTime } from '../../Chat/ChatList/components/ChatCard/hooks';
import type { IChatCard } from '../../Chat/ChatList/components/ChatCard/types/ChatCard';
import { TypeIcon } from '../../Chat/TypeIcon';

export const ChatInteractionCard: FC<Omit<IChatCard, 'isInCRM'>> = ({
    queueName = '',
    selected,
    title,
    lastMsgDts,
    channelType,
    message = '',
    pendingDisp,
    pendingAccept,
    waitingForUser,
    onAccept,
    onReject,
    onEnd,
    onTransfer,
    onEditDisposition,
    onDiscard,
    acceptPromise,
    disabled = false,
    sourceColor,
    isDraft,
    onClick,
}) => {
    const { t } = useTranslation();
    const formattedTime = useFormattedTime(lastMsgDts);
    const sourceColorHex = digitalColorMap[sourceColor];

    const timer = !pendingDisp && !pendingAccept && (
        <div
            data-aid={TIMER}
            className='typography-descriptor text-neutral-b2 text-right'
        >
            {formattedTime}
        </div>
    );

    const formattedQueueName = isDraft
        ? queueName
        : t('CRM.COMMON.TO_QUEUE', { queueName });

    const waitingOnUserNotification = waitingForUser &&
        !selected &&
        !pendingAccept &&
        !pendingDisp && (
            <Badge
                variant='contained'
                type='dot'
                color='warning'
                size='medium'
                classes={{ dot: 'bg-accent-orange' }}
                data-aid={CHAT_PREVIEW_MODAL.WAITING_ON_USER_NOTIFICATION_ICON}
            />
        );

    const pendingAcceptContent = (
        <div className='flex items-center gap-1.5'>
            <PendingAcceptActions
                onAccept={onAccept}
                onReject={onReject}
                acceptPromise={acceptPromise}
                disabled={disabled}
            />
        </div>
    );

    const pendingDispositionContent = (
        <div className='flex items-center justify-between'>
            <div className='typography-mainText text-warning min-w-0 flex-1 text-sm'>
                {t('CHAT.INACTIVE_MSG')}
            </div>
            <IconButton
                symbol={NotesMd}
                TooltipProps={{
                    title: t('CHAT.ACTIONS.DISPOSITION'),
                }}
                label={t('CHAT.ACTIONS.DISPOSITION')}
                variant='icon'
                size='small'
                className='text-neutral-b2 hover:text-neutral-b1 transition-none'
                onClick={onEditDisposition}
            />
        </div>
    );

    const activeMessageContent = (
        <div className='relative flex h-6 items-center'>
            <div
                data-aid={MESSAGE_CONTENT}
                className={clsx(
                    'min-w-0 flex-1',
                    selected && 'group-focus-within:pr-13 group-hover:pr-13'
                )}
            >
                <Text
                    useTooltip
                    titleWhenOverflow={1}
                    className='typography-mainText text-neutral-b1 line-clamp-1 text-sm'
                >
                    {message}
                </Text>
            </div>
            {selected && (
                <div className='pointer-events-none absolute right-0 top-1/2 flex -translate-y-1/2 space-x-1 opacity-0 group-focus-within:pointer-events-auto group-focus-within:opacity-100 group-hover:pointer-events-auto group-hover:opacity-100'>
                    <ActiveChatActions
                        onEnd={onEnd}
                        onTransfer={onTransfer}
                        onDiscard={onDiscard}
                        isDraft={isDraft}
                    />
                </div>
            )}
        </div>
    );

    const renderContentSection = () => {
        if (pendingAccept) {
            return pendingAcceptContent;
        }

        if (pendingDisp) {
            return pendingDispositionContent;
        }

        return activeMessageContent;
    };

    return (
        <InteractionCardWrapper
            className='group'
            data-aid={CHAT_CARD}
            onClick={onClick}
            active={selected}
            data-interaction-card
        >
            <div className='cursor-pointer space-y-1 text-sm'>
                <div className='flex items-center gap-2'>
                    <div className='w-fit' data-aid={INTERACTION_TYPE_ICON}>
                        <TypeIcon
                            inColor={sourceColorHex}
                            source={channelType}
                            keyboardFocusable
                            className='flex flex-grow-0'
                            tooltipVariant='spring'
                        />
                    </div>
                    <div className='min-w-0 flex-1' data-aid={CONTACT_NAME}>
                        <Text
                            useTooltip
                            titleWhenOverflow={1}
                            className='typography-subtitle line-clamp-1 font-bold'
                        >
                            {title}
                        </Text>
                    </div>
                    {timer}
                </div>
                <div className='pl-5.5 space-y-1'>
                    <div className='flex items-center'>
                        <div className='min-w-0 flex-1' data-aid={QUEUE_NAME}>
                            <Text
                                useTooltip
                                titleWhenOverflow={1}
                                className='text-neutral-b2 typography-descriptor line-clamp-1'
                            >
                                {formattedQueueName}
                            </Text>
                        </div>
                        {waitingOnUserNotification}
                    </div>
                    {renderContentSection()}
                </div>
            </div>
        </InteractionCardWrapper>
    );
};
