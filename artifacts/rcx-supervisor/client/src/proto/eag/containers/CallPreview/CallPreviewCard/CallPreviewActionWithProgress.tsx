import { Fragment } from 'react';

import { LinearProgressIndicator } from '@ringcentral/spring-ui';
import clsx from 'clsx';

export type CallPreviewActionWithProgressProps = {
    label: string;
    pendingText: string;
    additionalBarClassName?: string;
    isTimeoutAction: boolean;
    isPending: boolean;
    duration: number;
    countdown: number;
    isTimeout: boolean;
};

export const CallPreviewActionWithProgress = (
    props: CallPreviewActionWithProgressProps
) => {
    const {
        label,
        pendingText,
        additionalBarClassName,
        isTimeoutAction,
        isPending,
        duration,
        countdown,
        isTimeout,
    } = props;

    if (isPending) {
        return pendingText;
    }

    if (!isTimeoutAction || isTimeout) {
        return label;
    }

    const barClassName = clsx('rounded-none', additionalBarClassName);

    return (
        <Fragment>
            <LinearProgressIndicator
                max={duration}
                value={duration - countdown}
                variant='determinate'
                className='absolute left-0 top-0 h-full w-full'
                classes={{
                    track: 'w-full h-full bg-neutral-w0-t20',
                    bar: barClassName,
                }}
                aria-hidden='true'
            />
            <div className='z-10'>
                {label}
                <div className='inline-block w-[3em] pl-1 text-start text-inherit'>
                    {`(${countdown}s)`}
                </div>
            </div>
        </Fragment>
    );
};
