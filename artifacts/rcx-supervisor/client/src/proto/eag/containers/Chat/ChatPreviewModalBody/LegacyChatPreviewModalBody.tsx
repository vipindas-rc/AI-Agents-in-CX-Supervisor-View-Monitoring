import type { FC } from 'react';

import { DateTime } from '@ringcx/shared';

import {
    ChatPendingLabel,
    ChatPendingValue,
} from './ChatPreviewModalBody.styled';
import type { ILegacyChatPreviewModalBody } from './types/ChatPreviewModalBody';
import { LEGACY_CHAT_PREVIEW_MODAL_BODY } from '../../../constants/testIds';
import translate from '../../../helpers/translate';

const LegacyChatPreviewModalBody: FC<ILegacyChatPreviewModalBody> = ({
    chat,
}) => {
    const chatQueue = chat && chat.chatQueueName ? chat.chatQueueName : '';
    const channelType = chat && chat.channelType ? chat.channelType : '';
    const chatDts = chat && chat.lastMsgDts ? chat.lastMsgDts : null;

    const getDisplayTime = (chatDts: null | DateTime.Instance) => {
        let displayTime = '';
        if (chatDts && DateTime.isValidDateTime(chatDts)) {
            displayTime = DateTime.localizedDateTimeFromObject({
                dateTime: chatDts,
                toLocalizedPresetFormat: DateTime.PRESET.DATETIME_SHORT,
            });
        }
        return displayTime;
    };

    return (
        <div data-aid={LEGACY_CHAT_PREVIEW_MODAL_BODY}>
            <div>
                <ChatPendingLabel>
                    {translate('CHAT.CHAT_PREVIEW.QUEUE')}
                </ChatPendingLabel>
                <ChatPendingValue>{chatQueue}</ChatPendingValue>
            </div>
            <div>
                <ChatPendingLabel>
                    {translate('CHAT.CHAT_PREVIEW.TYPE')}
                </ChatPendingLabel>
                <ChatPendingValue>
                    {translate(`CHAT.CHAT_PREVIEW.${channelType}`)}
                </ChatPendingValue>
            </div>
            <div>
                <ChatPendingLabel>
                    {translate('CHAT.CHAT_PREVIEW.DATE_TIME')}
                </ChatPendingLabel>
                <ChatPendingValue>{getDisplayTime(chatDts)}</ChatPendingValue>
            </div>
        </div>
    );
};

export default LegacyChatPreviewModalBody;
