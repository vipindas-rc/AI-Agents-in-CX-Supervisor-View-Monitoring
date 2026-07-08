import { useRef, useCallback } from 'react';

import { useSyncScrollContext } from './SyncScrollContext';

interface UseSyncScrollOptions {
    enabled?: boolean;
    throttleMs?: number;
}

export const useSyncScroll = (options: UseSyncScrollOptions = {}) => {
    const { enabled = true } = options;
    const { registerElement, unregisterElement } = useSyncScrollContext();
    const elementRef = useRef<HTMLElement | null>(null);
    const cleanupRef = useRef<(() => void) | null>(null);
    return useCallback(
        (element: HTMLElement | null) => {
            if (cleanupRef.current) {
                cleanupRef.current();
                cleanupRef.current = null;
            }

            if (element && enabled) {
                elementRef.current = element;
                registerElement(element);

                cleanupRef.current = () => {
                    unregisterElement(element);
                };
            } else {
                elementRef.current = null;
            }
        },
        [enabled, registerElement, unregisterElement]
    );
};
