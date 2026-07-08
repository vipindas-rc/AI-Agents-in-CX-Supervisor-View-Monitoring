import { useState, useEffect, useMemo, useCallback } from 'react';

import { DateTime } from '@ringcx/shared';

import translate from '../../../../../../helpers/translate';
import type { IChatCard } from '../types/ChatCard';

export const useFormattedTime = (
    lastMsgDts: IChatCard['lastMsgDts']
): string => {
    const [now, setNow] = useState<DateTime.Instance>(DateTime.now());
    const [intervalId, setIntervalId] = useState<number>();
    // clean up interval old if interval changes
    useEffect(() => removeInterval, [intervalId]);

    const resetInterval = useCallback(() => {
        removeInterval();
        setIntervalId(
            window.setInterval(() => {
                setNow(DateTime.now());
            }, 1000 * 60)
        );
    }, [intervalId]);

    const removeInterval = () => {
        return intervalId ? clearInterval(intervalId) : undefined;
    };

    return useMemo<string>(() => {
        resetInterval();
        const time = lastMsgDts;

        if (!DateTime.isValidDateTime(time)) {
            return '';
        }
        const timeDiff = DateTime.now()
            .diff(time, ['days', 'hour', 'minutes', 'seconds', 'milliseconds'])
            .toObject();

        const days = Number(timeDiff.days?.toFixed(0)) || 0;
        const hours = Number(timeDiff.hours?.toFixed(0)) || 0;
        const minutes = Number(timeDiff.minutes?.toFixed(0)) || 0;

        if (days > 0) {
            return translate('CHAT.DURATION.DAYS', {
                count: days,
            });
        } else if (hours > 0) {
            return translate('CHAT.DURATION.HOURS', {
                count: hours,
            });
        } else if (minutes > 0) {
            return translate('CHAT.DURATION.MINUTES', {
                count: minutes,
            });
        } else if (
            Number(timeDiff.seconds?.toFixed(0)) > 0 ||
            Number(timeDiff.milliseconds?.toFixed(0)) > 0
        ) {
            return translate('CHAT.DURATION.LT_1_MIN');
        }

        return '';
    }, [lastMsgDts, now]); // keep now to trigger refresh
};
