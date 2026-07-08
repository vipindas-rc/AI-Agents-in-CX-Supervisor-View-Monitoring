import type { FC, SyntheticEvent } from 'react';
import { memo, useCallback } from 'react';

import { StyledTableRow } from './TableRow.styled';
import type { ITableRowProps } from './types';
import { StyledTableCell, StyledCheckboxCell } from '../TableCell';
import { TableCheckbox } from '../TableCheckbox.styled';
import type { ITableColumn } from '../TableHead/types';

const TableRow: FC<ITableRowProps> = ({
    isDisabled,
    isSelectable,
    isSelected,
    id,
    onRowClick = null,
    onSelectRow = null,
    payload,
    columns,
    ...restProps
}) => {
    const renderCells = useCallback(() => {
        let counter = 0;

        return columns.map((column: ITableColumn) => (
            <StyledTableCell
                isDisabled={isDisabled}
                key={`${id}-${counter++}`}
                component='td'
                scope='row'
                padding={column.disablePadding ? 'none' : 'default'}
                align={column.align}
            >
                {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
                {/* @ts-ignore */}
                {payload[column.accessor]}
            </StyledTableCell>
        ));
    }, [columns, isDisabled, id, payload]);

    const handleClickRow = useCallback(
        () => !isDisabled && onRowClick && onRowClick(id),
        [isDisabled, onRowClick, id]
    );

    const handleSelectRow = useCallback(
        () => !isDisabled && onSelectRow && onSelectRow(id),
        [isDisabled, onSelectRow, id]
    );

    const handleCheckboxClick = useCallback(
        (e: SyntheticEvent) => e.stopPropagation(),
        []
    );

    return (
        <StyledTableRow
            onClick={handleClickRow}
            aria-checked={isSelected}
            key={id}
            aria-disabled={isDisabled}
            isClickable={!isDisabled && !!onRowClick}
            {...restProps}
        >
            {isSelectable && (
                <StyledCheckboxCell padding='checkbox' component='td'>
                    <TableCheckbox
                        checked={isSelected}
                        disabled={isDisabled}
                        inputProps={{ 'aria-labelledby': `${id}-check` }}
                        onClick={handleCheckboxClick}
                        onChange={handleSelectRow}
                    />
                </StyledCheckboxCell>
            )}
            {renderCells()}
        </StyledTableRow>
    );
};

export default memo(TableRow);
