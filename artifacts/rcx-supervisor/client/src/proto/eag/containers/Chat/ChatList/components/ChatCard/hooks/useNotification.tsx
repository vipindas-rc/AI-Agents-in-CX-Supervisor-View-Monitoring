import { useMemo } from 'react';

import { CHAT_PREVIEW_MODAL } from '../../../../../../constants/testIds';
import { NotificationIcon } from '../components/NotificationIcon';
import { WaitingOnUserNotification } from '../components/WaitingOnUserNotification';
import type { IChatCard } from '../types/ChatCard';

export const useNotification = (
    pendingDisp: IChatCard['pendingDisp'],
    pendingAccept: IChatCard['pendingAccept'],
    selected: IChatCard['selected'],
    waitingForUser: IChatCard['waitingForUser']
): JSX.Element | null =>
    useMemo(() => {
        if (pendingDisp) {
            return <NotificationIcon />;
        } else if (
            waitingForUser &&
            !(selected || pendingAccept || pendingDisp)
        ) {
            return (
                <WaitingOnUserNotification
                    data-aid={
                        CHAT_PREVIEW_MODAL.WAITING_ON_USER_NOTIFICATION_ICON
                    }
                />
            );
        } else {
            return null;
        }
    }, [pendingDisp, pendingAccept, selected, waitingForUser]);
