import type { Dispatch, SetStateAction } from 'react';
import { useEffect, useRef } from 'react';

import { DEFAULT_TOPHAT_STATE } from './constants';
import type { ITopHatOptions, ITopHatService, ITopHatState } from './types';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const noop = () => {};
// eslint-disable-next-line @typescript-eslint/no-empty-function
const noopMessage = () => {};

export const TopHatService: ITopHatService = {
    open: noop,
    clear: noop,
    toggle: noop,
    close: noop,

    error: noopMessage,
    info: noopMessage,
    success: noopMessage,
    warning: noopMessage,

    get: () => DEFAULT_TOPHAT_STATE,
};

export const useTopHatEventService = (
    topHat: ITopHatState,
    setTopHat: Dispatch<SetStateAction<ITopHatState>>
) => {
    const t = useRef<number | null>(null);

    useEffect(() => {
        TopHatService.open = () => {
            setTopHat((prevState) => ({ ...prevState, open: true }));
        };
        TopHatService.close = () => {
            setTopHat((prevState) => ({ ...prevState, open: false }));
        };
        TopHatService.toggle = () => {
            setTopHat((prevState) => ({ ...prevState, open: !prevState.open }));
        };
        TopHatService.clear = () => {
            setTopHat(DEFAULT_TOPHAT_STATE);
        };

        const set = (
            message: string,
            type: ITopHatState['type'],
            options?: ITopHatOptions
        ) => {
            if (options?.timeout) {
                t.current = window.setTimeout(() => {
                    TopHatService.close();
                    t.current = null;
                }, options.timeout * 1000);
            }

            setTopHat({
                message,
                type,
                options,
                open: true,
            });
        };

        TopHatService.info = (message: string, options?: ITopHatOptions) => {
            set(message, 'info', options);
        };
        TopHatService.error = (message: string, options?: ITopHatOptions) => {
            set(message, 'error', options);
        };
        TopHatService.warning = (message: string, options?: ITopHatOptions) => {
            set(message, 'warning', options);
        };
        TopHatService.success = (message: string, options?: ITopHatOptions) => {
            set(message, 'success', options);
        };
    }, [setTopHat]);

    useEffect(() => {
        if (!topHat.options?.timeout && t.current) {
            window.clearTimeout(t.current);
        }

        TopHatService.get = () => topHat;
    }, [topHat]);
};
