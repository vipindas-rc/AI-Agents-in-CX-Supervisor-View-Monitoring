import styled, { css } from 'styled-components';

import { focusVisibleInsideOverflowStyles } from '../../../../helpers/accessibility';

export const Item = styled.div<{
    isSortable: boolean;
}>`
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: ${({ theme }) => theme.font.gridListHead.fontSize};
    letter-spacing: ${({ theme }) => theme.font.gridListHead.letterSpacing};
    line-height: ${({ theme }) => theme.font.gridListHead.lineHeight};
    font-weight: ${({ theme }) => theme.font.gridListHead.fontWeight};
    display: flex;
    justify-content: start;
    align-items: center;
    user-select: none;
    border-radius: 2px;
    outline: none;

    ${({ isSortable }) =>
        isSortable &&
        css`
            cursor: pointer;
            ${focusVisibleInsideOverflowStyles}
        `}
`;
