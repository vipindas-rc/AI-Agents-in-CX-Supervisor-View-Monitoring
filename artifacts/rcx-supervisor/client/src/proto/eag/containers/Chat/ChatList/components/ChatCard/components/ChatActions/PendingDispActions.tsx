import type { FC } from 'react';

import { Tooltip, Edit } from '@ringcx/ui';

import { StyledActionButton } from './ChatActions.styled';
import translate from '../../../../../../../helpers/translate';
import type { IChatCard } from '../../types/ChatCard';

type IChatActions = Pick<IChatCard, 'onEditDisposition'>;
export const PendingDispActions: FC<IChatActions> = ({ onEditDisposition }) => {
    return (
        <Tooltip {...{ title: translate('CHAT.ACTIONS.DISPOSITION') }}>
            <StyledActionButton
                {...{ onClick: onEditDisposition, size: 'small' }}
            >
                <Edit />
            </StyledActionButton>
        </Tooltip>
    );
};
