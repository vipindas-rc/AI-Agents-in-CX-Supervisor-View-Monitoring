import styled, { css } from 'styled-components';

import {
    TOGGLE_HEIGHT,
    TOGGLE_BORDER,
    BORDER_RADIUS,
} from '../../../constants';
import type { DropDownSizes } from '../../../types';

export const StyledToggleSpacer = styled.div<{
    isOpen: boolean;
    size: DropDownSizes;
}>`
    && {
        opacity: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        width: 100%;
        height: ${TOGGLE_HEIGHT}px;
        padding: 0 12px;
        background-color: ${(p) => p.theme.colors.background};
        border-radius: ${(p) =>
            p.isOpen
                ? `${BORDER_RADIUS}px ${BORDER_RADIUS}px 0 0`
                : `${BORDER_RADIUS}px`};

        ${(p) =>
            !p.isOpen &&
            css`
                height: ${TOGGLE_HEIGHT - 2 * TOGGLE_BORDER}px;
            `}

        ${(p) =>
            p.size === 'small' &&
            css`
                height: 32px;
            `}
    }
`;
