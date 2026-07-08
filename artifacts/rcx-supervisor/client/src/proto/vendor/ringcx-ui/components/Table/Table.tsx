import type { FC, ReactNode } from 'react';
import { memo, useMemo, useCallback } from 'react';

import TableBody from '@material-ui/core/TableBody';
import AutoSizer from 'react-virtualized-auto-sizer';

import TableHead from './components/TableHead';
import { TableRow } from './components/TableRow';
import { useTableSort } from './hooks/useTableSort';
import { StyledTable, TrPlaceholder } from './Table.styled';
import type { ITableProps, ITableRow } from './types';
import VirtualScroll from '../VirtualScroll';

const Table: FC<ITableProps> = ({
    isSelectable = false,
    selectAllLabel,
    onSelectAll = null,
    onSelectRow = null,
    onRowClick = null,
    columns,
    rows,
    virtualScroll = false,
    ...restProps
}) => {
    const rowCount = rows.length;
    const { onSort, order, orderBy, sortedRows } = useTableSort(rows);

    const numSelected = useMemo(
        () =>
            sortedRows.reduce(
                (acc, { isSelected }) => acc + (isSelected ? 1 : 0),
                0
            ),
        [sortedRows]
    );
    const numDisabled = useMemo(
        () =>
            sortedRows.reduce(
                (acc, { isDisabled }) => acc + (isDisabled ? 1 : 0),
                0
            ),
        [sortedRows]
    );

    const renderRow = useCallback(
        (row: ITableRow) => {
            const { id, isDisabled = false, isSelected = false, payload } = row;
            return (
                <TableRow
                    {...{
                        key: id,
                        isSelectable,
                        isDisabled,
                        id,
                        payload,
                        isSelected,
                        columns,
                        onRowClick,
                        onSelectRow,
                    }}
                />
            );
        },
        [columns, isSelectable, onRowClick, onSelectRow]
    );

    const renderRows = useMemo(
        () => sortedRows.map(renderRow),
        [sortedRows, renderRow]
    );

    const renderListWrapper = useCallback(
        (
            getRows: () => ReactNode[],
            compensationTop: number,
            compensationBottom: number
        ) => (
            <StyledTable size='medium' {...restProps}>
                <TableHead
                    {...{
                        onSelectAll,
                        order,
                        orderBy,
                        numSelected,
                        numDisabled,
                        rowCount,
                        onSort,
                        columns,
                        isSelectable,
                        selectAllLabel,
                    }}
                />
                <TableBody>
                    <TrPlaceholder height={compensationTop}>
                        <td colSpan={columns.length} />
                    </TrPlaceholder>
                    {getRows()}
                    <TrPlaceholder height={compensationBottom}>
                        <td colSpan={columns.length} />
                    </TrPlaceholder>
                </TableBody>
            </StyledTable>
        ),
        [
            restProps,
            onSelectAll,
            order,
            orderBy,
            numSelected,
            numDisabled,
            rowCount,
            onSort,
            columns,
            isSelectable,
            selectAllLabel,
        ]
    );

    const renderScroll = useMemo(
        () => (
            <AutoSizer>
                {({ width, height }) => (
                    <VirtualScroll
                        renderData={sortedRows}
                        renderRow={renderRow}
                        width={width}
                        height={height}
                        renderListWrapper={renderListWrapper}
                        rowHeight={38}
                    />
                )}
            </AutoSizer>
        ),
        [renderRow, sortedRows, renderListWrapper]
    );

    const renderPlain = useMemo(
        () => (
            <StyledTable size='medium' {...restProps}>
                <TableHead
                    {...{
                        onSelectAll,
                        order,
                        orderBy,
                        numSelected,
                        numDisabled,
                        rowCount,
                        onSort,
                        columns,
                        isSelectable,
                        selectAllLabel,
                    }}
                />
                <TableBody>{renderRows}</TableBody>
            </StyledTable>
        ),
        [
            restProps,
            onSelectAll,
            order,
            orderBy,
            numSelected,
            numDisabled,
            rowCount,
            onSort,
            columns,
            isSelectable,
            selectAllLabel,
            renderRows,
        ]
    );

    return virtualScroll ? renderScroll : renderPlain;
};

export default memo(Table);
