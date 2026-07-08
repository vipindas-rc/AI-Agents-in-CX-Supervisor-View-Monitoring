import styled, { css } from 'styled-components';

import type { SortIconType, ArrowIcon } from './types';
import { SortDirection } from '../../../../helpers/sorting';
import { Arrow } from '../../../../icons';

const StyleArrow = styled(Arrow)<ArrowIcon>`
    position: relative;
    color: ${({ selected, theme }) => selected && theme.colors.gray[900]};
    width: 12px;
    height: 12px;
`;

export const StyledArrowUp = styled(StyleArrow)`
    transform: rotate(180deg) !important;
    top: 7px;
`;

export const StyledArrowDown = styled(StyleArrow)`
    top: 1px;
`;

export const StyledSortIcon = styled.div<SortIconType>`
    display: flex;
    flex-direction: column;
    width: 32px;
    height: 32px;
    flex-shrink: 0;
    align-items: center;
    border-radius: 50%;
    color: ${({ theme }) => theme.colors.gray[700]};

    ${({ isSortable, theme }) =>
        !isSortable &&
        css`
            color: ${theme.colors.gray[300]};
        `}

    &:hover {
        ${({ isSortable, theme }) =>
            isSortable &&
            css`
                background-color: ${theme.colors.gray[100]};
            `}
        ${({ direction, isSortable, theme }) =>
            isSortable &&
            direction === SortDirection.NONE &&
            css`
                ${StyleArrow} {
                    color: ${theme.colors.gray[900]};
                }
            `}
`;
