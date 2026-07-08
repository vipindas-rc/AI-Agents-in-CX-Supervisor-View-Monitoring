import type { PropsWithChildren } from 'react';

import { TableCell, TableHead } from '@material-ui/core';
import styled, { css } from 'styled-components';

import {
    StyledArrowDown,
    StyledArrowUp,
    StyledSortIcon,
} from './components/SortIcon/SortIcon.styled';
import type { IStyledColumnTableCell } from './types';
import { UNUSED } from '../../../../helpers/usage';

export const Label = styled.div<{ width?: number }>`
    display: flex;
    align-items: center;
    text-align: left;
    margin-left: 16px;
    width: 100%;
    ${({ width }) =>
        width &&
        css`
            max-width: ${width}px;
        `}
`;

export const LabelText = styled.div`
    white-space: normal;
    overflow: hidden;
    text-overflow: ellipsis;
`;

export const LabelHover = styled.div`
    display: inline-flex;
    cursor: pointer;
`;

export const StyledTableHeadCell = styled(
    ({
        isSortEnabled,
        width,
        children,
        ...rest
    }: PropsWithChildren<IStyledColumnTableCell>) => {
        UNUSED(isSortEnabled, width);
        return <TableCell {...rest}>{children}</TableCell>;
    }
)<IStyledColumnTableCell>`
    ${({ isSortEnabled, theme }) =>
        !isSortEnabled &&
        css`
            ${StyledSortIcon} {
                :hover {
                    background-color: transparent;
                    border-radius: 0;
                }

                ${StyledArrowUp},
                ${StyledArrowDown} {
                    color: ${theme.colors.gray[200]};
                }
            }
        `}
`;

export const StyledTableHead = styled(TableHead)`
    ${StyledTableHeadCell} {
        color: ${({ theme }) => theme.colors.gray[700]};
        font-size: 12px;
        font-weight: 500;
        letter-spacing: 0.4px;
        line-height: 16px;
        white-space: nowrap;
        padding: 0;
    }
`;
