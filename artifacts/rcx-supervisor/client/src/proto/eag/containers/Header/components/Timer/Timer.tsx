import type { FC } from 'react';
import { useMemo, useRef, useEffect, useCallback, Fragment } from 'react';

import type { TimerControls } from 'react-compound-timer';
import CompoundTimer from 'react-compound-timer';

import { Hours } from './Hours';
import {
    BREAK_TIMER_COMPONENT_ID,
    TIMER_COMPONENT_ID,
} from '../../../../constants/testIds';

interface ITimer {
    showBreakTimer: boolean;
    breakTimeExpired: boolean;
    breakWaitTime: number;
    breakOver: () => void;
    refreshTimer: number;
    ChromeSvc: any;
    $rootScope: any;
}

const Timer: FC<ITimer> = ({
    showBreakTimer,
    breakTimeExpired,
    breakWaitTime,
    breakOver,
    refreshTimer,
    ChromeSvc,
    $rootScope,
}) => {
    const resetCallback = useRef<TimerControls['reset'] | null>(null);
    const setTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const format = useCallback((value: number) => {
        if (setTimerRef.current) {
            clearTimeout(setTimerRef.current);
            setTimerRef.current = null;
        }
        setTimerRef.current = setTimeout(() => {
            $rootScope.$apply();
        }, 0);
        return `${value < 10 ? `0${value}` : value}`;
    }, []);

    useEffect(() => {
        resetCallback.current && resetCallback.current();
    }, [refreshTimer]);

    useEffect(() => {
        ChromeSvc.sendMessageViaPort({
            timerProps: {
                showBreakTimer,
                breakTimeExpired,
                breakWaitTime,
                refreshTimer,
            },
        });
    }, [breakTimeExpired, breakWaitTime, refreshTimer, showBreakTimer]);

    const restTimerCallback = useCallback((reset: TimerControls['reset']) => {
        resetCallback.current = reset;
    }, []);

    const hourComponent = useMemo(() => <Hours />, []);

    const timerComponent = useMemo(
        () => (
            <div data-aid={TIMER_COMPONENT_ID}>
                <CompoundTimer formatValue={format}>
                    {({ reset }: TimerControls) => (
                        <Fragment>
                            {hourComponent}
                            {restTimerCallback(reset) as unknown as null}
                        </Fragment>
                    )}
                </CompoundTimer>
            </div>
        ),
        [hourComponent, format, restTimerCallback]
    );

    const breakTimerComponent = useMemo(
        () => (
            <div data-aid={BREAK_TIMER_COMPONENT_ID} key={breakWaitTime}>
                <CompoundTimer
                    initialTime={breakWaitTime * 1000}
                    direction='backward'
                    lastUnit='h'
                    checkpoints={[
                        {
                            time: 0,
                            callback: breakOver,
                        },
                    ]}
                    formatValue={format}
                >
                    {({ reset }: TimerControls) => (
                        <Fragment>
                            {hourComponent}
                            {restTimerCallback(reset) as unknown as null}
                        </Fragment>
                    )}
                </CompoundTimer>
            </div>
        ),
        [hourComponent, format, breakOver, breakWaitTime, restTimerCallback]
    );

    return (
        <Fragment>
            {!showBreakTimer && timerComponent}
            {showBreakTimer && !breakTimeExpired && breakTimerComponent}
            {showBreakTimer && breakTimeExpired && (
                <Fragment>-{timerComponent}</Fragment>
            )}
        </Fragment>
    );
};

export default Timer;
