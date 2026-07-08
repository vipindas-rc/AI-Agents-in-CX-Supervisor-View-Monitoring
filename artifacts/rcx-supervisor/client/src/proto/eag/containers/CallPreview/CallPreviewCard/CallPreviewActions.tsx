import { Fragment, type ComponentProps } from 'react';

import { Button } from '@ringcentral/spring-ui';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import { CallPreviewActionWithProgress } from './CallPreviewActionWithProgress';
import { TimeoutAction } from './types';

export type CallPreviewActionsProps = {
    size?: ComponentProps<typeof Button>['size'];
    autoAnswer: boolean;
    duration: number;
    countdown: number;
    timeoutAction: TimeoutAction;
    pendingAction?: TimeoutAction;
    onReject: () => void;
    onAccept: () => void;
};

export const CallPreviewActions = (props: CallPreviewActionsProps) => {
    const {
        countdown,
        duration,
        autoAnswer,
        size = 'small',
        timeoutAction,
        pendingAction,
        onReject,
        onAccept,
    } = props;

    const { t } = useTranslation();

    const tooltipProps = autoAnswer
        ? { title: t('PHONE.CALL_PREVIEW.REJECT_DISABLED_TOOLTIP') }
        : undefined;

    const isRejectPending = pendingAction === TimeoutAction.Reject;
    const isAcceptPending = pendingAction === TimeoutAction.Accept;
    const isPending = isRejectPending || isAcceptPending;
    const isTimeout = countdown <= 0;

    const isRejectTimeoutAction = timeoutAction === TimeoutAction.Reject;
    // auto answer on always implies accept timeout action
    const isAcceptTimeoutAction = timeoutAction === TimeoutAction.Accept;
    const isRejectButtonDisabled = autoAnswer || isPending;
    const darkThemeStyle =
        'dark:border-danger-f dark:border-1 dark:border-solid ';

    return (
        <Fragment>
            <Button
                variant={isRejectTimeoutAction ? 'contained' : 'inverted'}
                color='danger'
                size={size}
                className={clsx(
                    '!pointer-events-auto flex justify-center overflow-hidden border-0 px-2.5',
                    isRejectButtonDisabled && 'cursor-not-allowed',
                    size === 'large' && 'w-30',
                    isAcceptTimeoutAction && darkThemeStyle
                )}
                onClick={() => onReject()}
                disabled={isRejectButtonDisabled}
                TooltipProps={tooltipProps}
            >
                <CallPreviewActionWithProgress
                    label={t('PHONE.CALL_PREVIEW.REJECT_LABEL')}
                    // there is no way to visual  and test the text. No need to translate this.
                    pendingText='Rejecting...'
                    additionalBarClassName='bg-danger'
                    isTimeoutAction={isRejectTimeoutAction}
                    isPending={isRejectPending}
                    duration={duration}
                    countdown={countdown}
                    isTimeout={isTimeout}
                />
            </Button>
            <Button
                variant='contained'
                color='primary'
                size={size}
                onClick={onAccept}
                disabled={isPending}
                className={clsx({
                    'flex justify-center overflow-hidden border-0 px-2.5': true,
                    'w-30': size === 'large',
                })}
            >
                <CallPreviewActionWithProgress
                    label={t('PHONE.CALL_PREVIEW.ACCEPT_LABEL')}
                    pendingText={t('PHONE.CALL_PREVIEW.ACCEPT_PENDING')}
                    isTimeoutAction={isAcceptTimeoutAction}
                    isPending={isAcceptPending}
                    duration={duration}
                    countdown={countdown}
                    isTimeout={isTimeout}
                />
            </Button>
        </Fragment>
    );
};
