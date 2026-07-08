import type { FC } from 'react';
import { Fragment } from 'react';

import { Tooltip, TransferDigital, Solve, Trashcan } from '@ringcx/ui';

import { StyledActionButton, CompleteActionButton } from './ChatActions.styled';
import { DIGITAL_END_MESSAGE_ACTION } from '../../../../../../../constants/testIds';
import translate from '../../../../../../../helpers/translate';
import type { IChatCard } from '../../types/ChatCard';

export interface IChatActions
    extends Pick<IChatCard, 'onEnd' | 'onTransfer' | 'onDiscard'> {
    isDraft: boolean;
}

export const ChatActions: FC<IChatActions> = ({
    onEnd,
    onTransfer,
    onDiscard,
    isDraft,
}) => {
    return (
        <Fragment>
            {!isDraft && (
                <Fragment>
                    <Tooltip {...{ title: translate('CHAT.ACTIONS.TRANSFER') }}>
                        <StyledActionButton
                            {...{
                                'aria-label': translate(
                                    'CHAT.ACTIONS.TRANSFER'
                                ),
                                onClick: onTransfer,
                                size: 'small',
                            }}
                        >
                            <TransferDigital />
                        </StyledActionButton>
                    </Tooltip>
                    <Tooltip {...{ title: translate('CHAT.ACTIONS.END') }}>
                        <CompleteActionButton
                            data-aid={DIGITAL_END_MESSAGE_ACTION}
                            aria-label={translate('CHAT.ACTIONS.END')}
                            {...{ onClick: onEnd, size: 'small' }}
                        >
                            <Solve />
                        </CompleteActionButton>
                    </Tooltip>
                </Fragment>
            )}
            {isDraft && (
                <Tooltip {...{ title: translate('CHAT.ACTIONS.DISCARD') }}>
                    <CompleteActionButton
                        data-aid={DIGITAL_END_MESSAGE_ACTION}
                        aria-label={translate('CHAT.ACTIONS.DISCARD')}
                        {...{ onClick: onDiscard, size: 'small' }}
                    >
                        <Trashcan />
                    </CompleteActionButton>
                </Tooltip>
            )}
        </Fragment>
    );
};
