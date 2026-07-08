import { useCallback, useEffect, useRef } from 'react';

import type { UseSimulationNotificationOptions } from './types';
import { TopHatPriorities } from '../../components/TopHat/constants';
import useTopHat from '../../components/TopHat/UseTopHat';

export const useSimulationNotification = ({
    message,
    isSimulation,
    onExitSimulation,
    actionTitle,
}: UseSimulationNotificationOptions) => {
    const topHatRef = useRef(useTopHat());
    const isSimulationRef = useRef<boolean>();
    isSimulationRef.current = isSimulation;

    const onClose = useCallback(() => {
        onExitSimulation().then(() => topHatRef.current.pop());
    }, [onExitSimulation]);

    useEffect(() => {
        const topHatInstance = topHatRef.current;
        if (isSimulation) {
            topHatInstance.push(message, {
                priority: TopHatPriorities.info + 5,
                primary: {
                    actionTitle,
                    action: onClose,
                },
            });
        }

        return () => {
            if (isSimulation && isSimulationRef.current) {
                topHatInstance.pop();
            }
        };

        // also please don't add `onClose` to deps FIXME: need to deal with `onExitSimulation` in AdminJS
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [actionTitle, message, isSimulation]);
};
