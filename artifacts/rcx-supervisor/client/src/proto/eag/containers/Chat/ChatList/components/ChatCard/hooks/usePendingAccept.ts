import type { SyntheticEvent } from 'react';
import { useCallback, useEffect, useState } from 'react';

import type { IChatCard } from '../types/ChatCard';

interface IUsePendingAccept {
    acceptPromise: IChatCard['acceptPromise'];
    onAccept: IChatCard['onAccept'];
}

interface IUsePendingAcceptResult {
    pendingAccept: boolean;
    handleAccept(event: SyntheticEvent): void;
}

export const usePendingAccept = ({
    acceptPromise,
    onAccept,
}: IUsePendingAccept): IUsePendingAcceptResult => {
    const [pendingAccept, setPendingAccept] = useState(false);

    useEffect(() => {
        if (!acceptPromise) {
            return;
        }

        (async () => {
            try {
                await acceptPromise;
            } finally {
                setPendingAccept(false);
            }
        })();
    }, [acceptPromise]);

    const handleAccept = useCallback(
        (event: SyntheticEvent) => {
            setPendingAccept(true);
            onAccept(event);
        },
        [onAccept]
    );

    return { pendingAccept, handleAccept };
};
