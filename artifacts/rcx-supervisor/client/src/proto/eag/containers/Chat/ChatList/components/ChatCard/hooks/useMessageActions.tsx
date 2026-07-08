import { useMemo } from 'react';

import { PendingDispActions, ChatActions } from '../components/ChatActions';
import { PendingAccept } from '../components/PendingAccept';
import type { IChatCard } from '../types/ChatCard';

export const useMessageActions = (
    isDraft: boolean,
    selected: IChatCard['selected'],
    pendingAccept: IChatCard['pendingAccept'],
    acceptPromise: IChatCard['acceptPromise'],
    pendingDisp: IChatCard['pendingDisp'],
    onAccept: IChatCard['onAccept'],
    onReject: IChatCard['onReject'],
    onEnd: IChatCard['onEnd'],
    onTransfer: IChatCard['onTransfer'],
    onEditDisposition: IChatCard['onEditDisposition'],
    onDiscard: IChatCard['onDiscard'],
    disabled: IChatCard['disabled']
): JSX.Element | null =>
    useMemo(() => {
        if (pendingAccept) {
            return (
                <PendingAccept
                    {...{ onAccept, onReject, acceptPromise, disabled }}
                />
            );
        } else if (pendingDisp) {
            return <PendingDispActions {...{ onEditDisposition }} />;
        } else if (selected) {
            return (
                <ChatActions {...{ onEnd, onTransfer, onDiscard, isDraft }} />
            );
        } else {
            return null;
        }
    }, [
        isDraft,
        selected,
        pendingAccept,
        pendingDisp,
        acceptPromise,
        disabled,
        onAccept,
        onEditDisposition,
        onEnd,
        onReject,
        onTransfer,
    ]);
