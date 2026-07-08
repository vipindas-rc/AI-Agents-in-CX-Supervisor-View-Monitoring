import { DateTime, type Duration } from 'luxon';

import {
    ChannelType,
    type ActivityLog,
} from '../../../common/services/transport';
import translate from '../../../helpers/translate';

export function calculateDuration(
    creationTime: string,
    completionTime: string
): string {
    const start = DateTime.fromISO(creationTime);
    const end = DateTime.fromISO(completionTime);

    const duration: Duration = end.diff(start, ['hours', 'minutes', 'seconds']);

    const hours = Math.floor(duration.as('hours'));
    const minutes = Math.floor(duration.as('minutes') % 60);
    const seconds = Math.floor(duration.as('seconds') % 60);

    const timeParts = [];
    if (hours > 0)
        timeParts.push(
            `${hours} ${translate('CHAT.INTERACTION_HISTORY.DURATION.HOURS')}`
        );
    if (minutes > 0)
        timeParts.push(
            `${minutes} ${translate(
                'CHAT.INTERACTION_HISTORY.DURATION.MINUTES'
            )}`
        );
    if (seconds > 0)
        timeParts.push(
            `${seconds} ${translate(
                'CHAT.INTERACTION_HISTORY.DURATION.SECONDS'
            )}`
        );

    return timeParts.join(' ');
}

export function formatHistoryDateTime(dateTime: string): string {
    return DateTime.fromISO(dateTime).toFormat('MM/dd/yy hh:mm a');
}

export function formatRawChannelType(
    historyActivity: ActivityLog
): ChannelType {
    const { channelType, callType } = historyActivity;
    if (channelType === 'voice') {
        if (callType === 'outbound') {
            return ChannelType.OutboundVoice;
        }
        if (callType === 'inbound') {
            return ChannelType.InboundVoice;
        }
    }
    return channelType as ChannelType;
}
