import styled, { css } from 'styled-components';

import Chip from '../../../../../../Chip';

export const StyledChip = styled(Chip)<{
    selected?: boolean;
}>`
    && {
        display: flex;
        flex-shrink: 0;
        max-width: 100%;

        ${({ theme, selected }) =>
            selected &&
            css`
                background-color: ${theme.colors.chip.selected};
            `}
    }
`;
