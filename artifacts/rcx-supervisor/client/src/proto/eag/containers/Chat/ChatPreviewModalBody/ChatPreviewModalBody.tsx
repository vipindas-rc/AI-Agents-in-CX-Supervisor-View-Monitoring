import type { FC } from 'react';

import { DateTime } from '@ringcx/shared';

import {
    ChatPendingLabel,
    ChatPendingValue,
} from './ChatPreviewModalBody.styled';
import type { IChatPreviewModalBody } from './types/ChatPreviewModalBody';
import { CHAT_PREVIEW_MODAL_BODY } from '../../../constants/testIds';
import translate from '../../../helpers/translate';

export const ChatPreviewModalBody: FC<IChatPreviewModalBody> = ({ task }) => {
    const authorName =
        task && task.edAuthorScreenName
            ? task.edAuthorScreenName
            : translate('CHAT.CHAT_PREVIEW.ANONYMOUS');

    const chatQueue = task && task.chatQueueName ? task.chatQueueName : '';
    const chatDts =
        task && task.edCreatedAt
            ? DateTime.fromSQLToDateTime(task.edCreatedAt)
            : '';
    const language = task && task.edLanguage ? task.edLanguage : '';
    const sourceName = task && task.edSourceName ? task.edSourceName : '';
    const categories =
        task && task.edCategories ? task.edCategories.join(', ') : '';

    const getDateTime = (chatDts: DateTime.Instance | '') => {
        if (chatDts && DateTime.isValidDateTime(chatDts)) {
            return DateTime.localizedDateTimeFromObject({
                dateTime: chatDts,
                toLocalizedPresetFormat: DateTime.PRESET.DATETIME_SHORT,
            });
        }
        return '';
    };

    return (
        <div data-aid={CHAT_PREVIEW_MODAL_BODY}>
            <div>
                <ChatPendingLabel>
                    {translate('CHAT.CHAT_PREVIEW.CHANNEL')}
                </ChatPendingLabel>
                <ChatPendingValue>{sourceName}</ChatPendingValue>
            </div>
            <div>
                <ChatPendingLabel>
                    {translate('CHAT.CHAT_PREVIEW.QUEUE')}
                </ChatPendingLabel>
                <ChatPendingValue>{chatQueue}</ChatPendingValue>
            </div>
            <div>
                <ChatPendingLabel>
                    {translate('CHAT.CHAT_PREVIEW.NAME')}
                </ChatPendingLabel>
                <ChatPendingValue>{authorName}</ChatPendingValue>
            </div>
            <div>
                <ChatPendingLabel>
                    {translate('CHAT.CHAT_PREVIEW.DATE_TIME')}
                </ChatPendingLabel>
                <ChatPendingValue>{getDateTime(chatDts)}</ChatPendingValue>
            </div>
            <div>
                <ChatPendingLabel>
                    {translate('CHAT.CHAT_PREVIEW.LANGUAGE')}
                </ChatPendingLabel>
                <ChatPendingValue>{language}</ChatPendingValue>
            </div>
            <div>
                <ChatPendingLabel>
                    {translate('CHAT.CHAT_PREVIEW.CATEGORIES')}
                </ChatPendingLabel>
                <ChatPendingValue>{categories}</ChatPendingValue>
            </div>
        </div>
    );
};
