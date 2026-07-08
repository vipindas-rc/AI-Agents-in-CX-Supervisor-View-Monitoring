import { useContext, useRef } from 'react';

import { TopHatContext } from './TopHatProvider';
import type { BuildNewTopHatFunction, ITopHatOptions } from './types';
import { NotificationTypes } from '../constants/Notifications';
import type { INotificationType } from '../constants/types';

const useOldTopHat = () => {
    const [topHatState, setTopHatState] = useContext(TopHatContext);
    const t = useRef<number | null>(null);

    const closeTopHat = () => {
        setTopHatState({ ...topHatState, open: false });
    };

    const toggleTopHat = () => {
        setTopHatState({ ...topHatState, open: !topHatState.open });
    };

    const showTopHat: BuildNewTopHatFunction = (type, message, options) => {
        setTopHatState({ type, message, options, open: true });

        if (options?.timeout) {
            t.current = window.setTimeout(() => {
                closeTopHat();
                t.current = null;
            }, options.timeout * 1000);
        } else if (t.current) {
            window.clearTimeout(t.current);
        }
    };

    const getTopHatConfig = () => topHatState;

    return {
        closeTopHat,
        toggleTopHat,
        showTopHat,
        getTopHatConfig,
        success: buildTopHatType(NotificationTypes.SUCCESS, showTopHat),
        error: buildTopHatType(NotificationTypes.ERROR, showTopHat),
        warning: buildTopHatType(NotificationTypes.WARNING, showTopHat),
        info: buildTopHatType(NotificationTypes.INFO, showTopHat),
    };
};

const buildTopHatType =
    (type: INotificationType['type'], callback: BuildNewTopHatFunction) =>
    (message: string, options?: ITopHatOptions) => {
        callback(type, message, options);
    };

export default useOldTopHat;
