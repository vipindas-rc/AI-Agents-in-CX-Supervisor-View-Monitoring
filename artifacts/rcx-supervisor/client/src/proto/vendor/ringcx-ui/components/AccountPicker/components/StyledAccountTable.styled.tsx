import { Table, TableBody, TableCell, TableRow } from '@material-ui/core';
import styled, { css } from 'styled-components';

import type { ICheckedTableRow } from '../types';
import { StyledCheckedTableCell } from './CheckedTableCell/CheckedTableCell.styled';
import { StyledTableHeadCell } from './EnhancedTableHead/EnhancedTableHead.styled';

const BOTTOM_LIST_PADDING = '8px';

export const StyledTableCell = styled(TableCell)``;

export const StyledTableRow = styled(TableRow)`
    height: 40px;
`;

export const TableContainer = styled.div`
    padding: 0 24px;
`;

// 40px - height of headers, 8px bottom padding
export const TableBodyContainer = styled(TableContainer)`
    padding-bottom: ${BOTTOM_LIST_PADDING};
    height: calc(100% - 40px);
    box-sizing: border-box;
`;

export const TableHeadContainer = styled(TableContainer)<{
    withBorder: boolean;
}>`
    ${({ withBorder, theme }) =>
        withBorder &&
        css`
            border-bottom: 1px solid ${theme.colors.gray[300]};

            ${StyledTableHeadCell},
            ${StyledCheckedTableCell} {
                border-bottom: none;
            }
        `}
    position: sticky;
    top: 0;
    background-color: ${({ theme }) => theme.colors.gray[0]};
    display: inline-block;
    vertical-align: bottom;
    z-index: 2;
`;

export const StyledTable = styled(Table)`
    table-layout: fixed;

    ${StyledCheckedTableCell} {
        padding: 9px 8px 8px 8px;
    }

    ${StyledTableHeadCell},
    ${StyledTableCell} {
        &:last-child {
            padding-right: 8px;
        }
    }
`;

export const StyledTableBody = styled(TableBody)`
    ${StyledTableRow} {
        cursor: pointer;
        vertical-align: top;

        &:hover {
            background-color: ${({ theme }) => theme.colors.gray[50]};
        }
    }

    ${StyledTableCell} {
        font-size: 14px;
        font-weight: normal;
        letter-spacing: 0.25px;
        line-height: 20px;
        padding: 9px 0 9px 16px;
        &:last-child {
            padding-right: 8px;
        }
    }
`;

export const StyledTableBodyRow = styled(StyledTableRow)<ICheckedTableRow>`
    ${({ checked }: ICheckedTableRow) =>
        checked &&
        css`
            background-color: rgba(0, 145, 255, 0.07) !important;
            cursor: default !important;
        `}

    ${({ disabled }: ICheckedTableRow) =>
        disabled &&
        css`
            background-color: rgba(255, 255, 255) !important;
            cursor: not-allowed !important;
        `}
`;
