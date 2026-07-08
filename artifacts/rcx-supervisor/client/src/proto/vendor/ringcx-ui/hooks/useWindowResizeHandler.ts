import { useState, useEffect } from 'react';

let timer: number | undefined;
let isResizeWindowHandlerSet = false;
const resizeHandlers: { [key in symbol]: () => void } = {};
const handleWindowResize = () =>
    Object.getOwnPropertySymbols(resizeHandlers).forEach((key) =>
        resizeHandlers[key]()
    );
const windowResizeDebounce = () => {
    window.clearTimeout(timer);
    timer = window.setTimeout(handleWindowResize, 100);
};

export const useWindowResizeHandler = (
    fn: (...args: unknown[]) => void,
    ...args: unknown[]
) => {
    const [symbolFn] = useState<symbol>(Symbol());

    resizeHandlers[symbolFn] = fn.bind(null, ...args);

    if (!isResizeWindowHandlerSet) {
        isResizeWindowHandlerSet = true;
        window.addEventListener('resize', windowResizeDebounce);
    }

    useEffect(() => {
        resizeHandlers[symbolFn]?.();

        return () => {
            delete resizeHandlers[symbolFn];

            if (!Object.getOwnPropertySymbols(resizeHandlers).length) {
                isResizeWindowHandlerSet = false;
                window.removeEventListener('resize', windowResizeDebounce);
            }
        };
    }, [fn, symbolFn]);
};
