import styled, { css } from 'styled-components';

import { RESPONSIVE_BREAKPOINT } from '../../constants/app';

export const StyledSubHeader = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-evenly;
    margin: 8px 0;
`;

export const StyledConnectionStatus = styled.span<{
    isActive: boolean;
}>`
    display: none;
    @media only screen and (width <= ${RESPONSIVE_BREAKPOINT}px) {
        display: flex;
        width: 25px;
        height: 25px;
        font-size: 12px;
        border: 1px solid ${({ theme }) => theme.colors.gray[400]};
        border-radius: 50%;
        color: ${({ theme }) => theme.colors.gray[400]};
        justify-content: center;
        align-items: center;
        cursor: pointer;
        ${({ isActive }) =>
            isActive &&
            css`
                border-color: ${({ theme }) => theme.colors.accent.denim};
                svg:not(:root) {
                    transform: scale(0.6);
                    overflow: unset;
                }
            `}
    }
`;
