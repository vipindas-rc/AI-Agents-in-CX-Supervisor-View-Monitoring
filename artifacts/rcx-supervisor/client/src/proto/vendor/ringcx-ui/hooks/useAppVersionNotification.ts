import { useEffect, useRef } from 'react';

import { AppVersionComparison } from '@ringcx/shared';

import { TopHatPriorities } from '../components/TopHat/constants';
import type { ITopHatMessage } from '../components/TopHat/types';
import useTopHat from '../components/TopHat/UseTopHat';

type UseAppVersionNotification = (props: {
    appName: string;
    timeout?: number;
    urgentDifference: ITopHatMessage;
    satisfiedDifference: ITopHatMessage;
    disabled?: boolean;
}) => void;

export const useAppVersionNotification: UseAppVersionNotification = ({
    appName,
    timeout,
    urgentDifference,
    satisfiedDifference,
    disabled,
}) => {
    const topHatRef = useRef(useTopHat());

    useEffect(() => {
        if (disabled) {
            return;
        }

        AppVersionComparison.start({
            appName,
            timeout,
            onUrgentDifference: () => {
                topHatRef.current.error(urgentDifference.text, {
                    priority: TopHatPriorities.error,
                    ...urgentDifference.options,
                });
            },
            onSatisfiedDifference: () => {
                topHatRef.current.info(satisfiedDifference.text, {
                    priority: TopHatPriorities.info,
                    closeWithX: { action: topHatRef.current.pop },
                    ...satisfiedDifference.options,
                });
            },
            onError: (reason) => {
                window.console.warn(reason);
            },
        });
    }, [
        appName,
        satisfiedDifference.options,
        satisfiedDifference.text,
        timeout,
        urgentDifference.options,
        urgentDifference.text,
        disabled,
    ]);
};
