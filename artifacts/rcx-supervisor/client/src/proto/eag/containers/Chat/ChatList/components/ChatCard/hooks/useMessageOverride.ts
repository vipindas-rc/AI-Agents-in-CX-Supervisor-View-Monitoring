import { useMemo } from 'react';

import translate from '../../../../../../helpers/translate';
import type { IChatCard } from '../types/ChatCard';

export const useMessageOverride = (
    pendingAccept: IChatCard['pendingAccept'],
    pendingDisp: IChatCard['pendingDisp']
): string =>
    useMemo<string>(() => {
        if (pendingAccept) {
            return translate('CHAT.NEW_EMPTY_MSG');
        } else if (pendingDisp) {
            return translate('CHAT.INACTIVE_MSG');
        } else {
            return '';
        }
    }, [pendingAccept, pendingDisp]);
