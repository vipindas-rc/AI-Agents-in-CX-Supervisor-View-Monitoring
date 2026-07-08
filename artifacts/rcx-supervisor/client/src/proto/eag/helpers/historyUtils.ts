import type { HistoryItemType } from '../common/services/transport';
import { HistoryChannelClass } from '../common/services/transport';

export function getTermReason(item: HistoryItemType) {
    const { state, dialDisposition } = item.dialog;
    const { channelClass } = item.dialog.channelConfiguration;
    const { termReason } = item.agentSegment;

    const isDroppedActiveVoiceCall =
        channelClass === HistoryChannelClass.VOICE &&
        state === 'ACTIVE' &&
        termReason === 'DROP';

    if (isDroppedActiveVoiceCall) {
        return 'EOC';
    }

    return termReason || dialDisposition;
}
