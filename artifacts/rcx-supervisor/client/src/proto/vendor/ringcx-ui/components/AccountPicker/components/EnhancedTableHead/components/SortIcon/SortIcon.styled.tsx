import styled, { css } from 'styled-components';

import type { IArrowIcon, ISortIcon } from './types';
import { Arrow } from '../../../../../../icons';
import { Order } from '../../../../constants';

const StyleArrow = styled(Arrow)<IArrowIcon>`
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

export const StyledSortIcon = styled.div<ISortIcon>`
    display: flex;
    flex-direction: column;
    min-width: 32px;
    min-height: 32px;
    align-items: center;

    &:hover {
        border-radius: 50%;
        background-color: ${({ theme }) => theme.colors.gray[100]};
        width: 32px;

        ${({ order, isSortEnabled, theme }) =>
            isSortEnabled &&
            order === Order.NONE &&
            css`
                ${StyleArrow} {
                    color: ${theme.colors.gray[900]};
                }
            `}
`;
