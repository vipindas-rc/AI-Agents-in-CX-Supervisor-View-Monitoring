import type { FC } from 'react';

import { StyledButton } from './ActionsToggle.styled';
import type { ActionsToggleType } from './types';
import { Kebab } from '../../../../icons';

const ActionsToggle: FC<ActionsToggleType> = ({ disabled, title = '' }) => {
    return (
        <StyledButton
            disabled={disabled}
            title={title}
            data-aid='actionsToggle'
        >
            <Kebab style={{ fontSize: 22 }} />
        </StyledButton>
    );
};

export default ActionsToggle;
