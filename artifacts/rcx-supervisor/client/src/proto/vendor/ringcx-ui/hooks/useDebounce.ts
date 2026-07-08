import { useCallback, useRef } from 'react';

type Func = (...args: unknown[]) => unknown;

export function useDebounce(
    func: Func,
    waitMilliseconds = 200
): (...args: Parameters<Func>) => void {
    const timeoutId = useRef<number | undefined>();

    return useCallback(
        (...args) => {
            const doLater = () => {
                timeoutId.current = undefined;
                func(...args);
            };

            if (timeoutId.current !== undefined) {
                window.clearTimeout(timeoutId.current);
            }

            timeoutId.current = window.setTimeout(doLater, waitMilliseconds);
        },
        [func, waitMilliseconds]
    );
}
