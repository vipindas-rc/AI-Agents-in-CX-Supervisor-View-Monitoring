import type { FC } from 'react';
import { Fragment } from 'react';

import { Button } from '@ringcentral/spring-ui';
import clsx from 'clsx';
import { useTranslation } from 'react-i18next';

import type { IPendingAccept } from '../../../Chat/ChatList/components/ChatCard/components/PendingAccept/PendingAccept';
import { usePendingAccept } from '../../../Chat/ChatList/components/ChatCard/hooks/usePendingAccept';

export const PendingAcceptActions: FC<IPendingAccept> = ({
    onAccept,
    onReject,
    acceptPromise,
    disabled,
}) => {
    const { t } = useTranslation();
    const { pendingAccept, handleAccept } = usePendingAccept({
        acceptPromise,
        onAccept,
    });

    const loading = pendingAccept || disabled;
    const darkThemeStyle =
        'dark:border-danger-f dark:border-1 dark:border-solid ';

    return (
        <Fragment>
            <Button
                variant='inverted'
                color='danger'
                size='small'
                disabled={loading}
                onClick={onReject}
                className={clsx(
                    'flex items-center justify-center text-[12px]',
                    darkThemeStyle
                )}
            >
                {t('SOFTPHONE.REJECT')}
            </Button>
            <Button
                loading={loading}
                variant='contained'
                color='primary'
                size='small'
                disabled={loading}
                onClick={handleAccept}
                CircularProgressIndicatorProps={{ className: 'absolute' }}
                classes={{
                    root: 'relative text-[12px] flex items-center justify-center px-1',
                    content: clsx(loading && 'opacity-0'),
                }}
            >
                {t('CHAT.PENDING.ACCEPT')}
            </Button>
        </Fragment>
    );
};
