import { useCallback, useRef } from 'react';

import type { BehaviorSubject } from 'rxjs';
import { useSyncExternalStore } from 'use-sync-external-store/shim';

export function useBehaviorSubject<T>(
    bs: BehaviorSubject<T>,
    onChange?: (actual: T) => void
) {
    const onChangeRef = useRef(onChange);
    const prev = useRef<T>(bs.getValue());

    onChangeRef.current = onChange;

    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const sub = bs.subscribe((actual) => {
                if (actual !== prev.current) {
                    onChangeRef.current?.(actual);
                }
                prev.current = actual;
                onStoreChange();
            });

            return () => sub.unsubscribe();
        },
        [bs]
    );

    const getSnapshot = useCallback(() => bs.getValue(), [bs]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
