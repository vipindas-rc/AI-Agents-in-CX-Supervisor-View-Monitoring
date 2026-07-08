import type { FC } from 'react';
import { Fragment } from 'react';

import { TextEclipse, Spinner } from '@ringcx/ui';

import { PendingButton } from './PendingAcceptStyled';
import translate from '../../../../../../../helpers/translate';
import { usePendingAccept } from '../../hooks/usePendingAccept';
import type { IChatCard } from '../../types/ChatCard';

export interface IPendingAccept
    extends Pick<IChatCard, 'onAccept' | 'onReject' | 'acceptPromise'> {
    disabled: boolean;
}
export const PendingAccept: FC<IPendingAccept> = ({
    onAccept,
    onReject,
    acceptPromise,
    disabled,
}) => {
    const { pendingAccept, handleAccept } = usePendingAccept({
        acceptPromise,
        onAccept,
    });

    return (
        <Fragment>
            <PendingButton
                {...{
                    variant: 'text',
                    color: 'secondary',
                    size: 'small',
                    disabled: pendingAccept || disabled,
                    onClick: onReject,
                }}
            >
                <TextEclipse tooltipMsg={translate('CHAT.PENDING.DECLINE')}>
                    {translate('CHAT.PENDING.DECLINE')}
                </TextEclipse>
            </PendingButton>
            <PendingButton
                {...{
                    variant: 'contained',
                    color: 'primary',
                    size: 'small',
                    disabled: pendingAccept || disabled,
                    onClick: handleAccept,
                }}
            >
                {pendingAccept || disabled ? (
                    <Spinner size='small' />
                ) : (
                    <TextEclipse tooltipMsg={translate('CHAT.PENDING.ACCEPT')}>
                        {translate('CHAT.PENDING.ACCEPT')}
                    </TextEclipse>
                )}
            </PendingButton>
        </Fragment>
    );
};
