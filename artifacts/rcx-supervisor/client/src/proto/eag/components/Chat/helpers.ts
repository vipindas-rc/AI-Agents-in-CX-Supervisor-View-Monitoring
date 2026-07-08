import { parsePhoneNumber } from '@ringcx/shared';

import { hhMmSsFilter } from '../../helpers/timeUtils';
import translate from '../../helpers/translate';
import { formatDateTimeForInteraction } from '../../layout/History/components/HistoryDetail/helpers';
import type { IDataPairs } from '../DataPairs/types/DataPairs';

export function getChatDetailsInformation(
    selectedChat: any
): Array<IDataPairs> {
    const detailInfo = [];
    if (selectedChat.chatQueueName) {
        detailInfo.push({
            label: translate('CURRENT_CALL.QUEUE'),
            value: selectedChat.chatQueueName,
        });
    }
    if (selectedChat.channelType) {
        detailInfo.push({
            label: translate('HISTORY.CHANNEL_TYPE'),
            value: formatChatChannelType(selectedChat.channelType),
        });
    }
    if (selectedChat.queueDts) {
        detailInfo.push({
            label: translate('CHAT.DETAIL.QUEUE_DTS'),
            value: formatDateTimeForInteraction(
                selectedChat.queueDts.toLocal().toISO()
            ),
        });
    }
    if (selectedChat.queueTime) {
        detailInfo.push({
            label: translate('CHAT.DETAIL.QUEUE_TIME'),
            value: hhMmSsFilter(selectedChat.queueTime),
        });
    }
    if (selectedChat.uii) {
        detailInfo.push({
            label: translate('GENERICS.LABELS.UII'),
            value: selectedChat.uii,
        });
    }
    if (selectedChat.channelType === 'SMS') {
        if (selectedChat.ani) {
            detailInfo.push({
                label: translate('CHAT.DETAIL.ANI'),
                value: parsePhoneNumber(selectedChat.ani).value,
            });
        }
        if (selectedChat.dnis) {
            detailInfo.push({
                label: translate('CHAT.DETAIL.DNIS'),
                value: parsePhoneNumber(selectedChat.dnis).value,
            });
        }
    }
    return detailInfo;
}

export function formatChatChannelType(rawType: string) {
    switch (rawType) {
        case 'WEB_CHAT':
            return translate('CHAT.DETAIL.CHANNEL_TYPE.WEB_CHAT');
        case 'SMS':
            return translate('CHAT.DETAIL.CHANNEL_TYPE.SMS');
        default:
            return rawType;
    }
}
