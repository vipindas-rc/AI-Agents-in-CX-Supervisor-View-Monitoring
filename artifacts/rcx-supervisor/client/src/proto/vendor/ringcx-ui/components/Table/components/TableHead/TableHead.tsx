import type { FC } from 'react';
import { memo, useCallback } from 'react';

import {
    TableHead as MaterialTableHead,
    TableRow,
    TableSortLabel,
} from '@material-ui/core';
import ArrowDropDownRounded from '@material-ui/icons/ArrowDropDownRounded';

import { StyledCheckboxHeadCell, StyledHeadCell } from './TableHeadCell.styled';
import type { ITableHeadProps } from './types';
import { TableCheckbox } from '../TableCheckbox.styled';

const TableHead: FC<ITableHeadProps> = ({
    onSelectAll,
    selectAllLabel = 'Select all',
    numSelected,
    numDisabled,
    rowCount,
    columns,
    isSelectable,
    order,
    orderBy,
    onSort,
}) => {
    const createSortHandler = (property: string) => () => onSort(property);
    const isChecked = !!numSelected && numSelected + numDisabled === rowCount;
    const isIndeterminate = !isChecked && numSelected > 0;
    const isDisabled = numDisabled === rowCount;
    const handleSelectAll = useCallback(
        () => onSelectAll && onSelectAll(),
        [onSelectAll]
    );
    return (
        <MaterialTableHead>
            <TableRow>
                {isSelectable && (
                    <StyledCheckboxHeadCell padding='checkbox' component='th'>
                        <TableCheckbox
                            checked={isChecked}
                            disabled={isDisabled}
                            onChange={handleSelectAll}
                            indeterminate={isIndeterminate}
                            inputProps={{ 'aria-label': selectAllLabel }}
                        />
                    </StyledCheckboxHeadCell>
                )}
                {columns.map((column) => {
                    const {
                        align,
                        disablePadding,
                        label,
                        isSortable,
                        accessor,
                        width,
                    } = column;
                    return (
                        <StyledHeadCell
                            key={accessor}
                            align={align}
                            padding={disablePadding ? 'none' : 'default'}
                            sortDirection={orderBy === accessor && order}
                            style={{ width }}
                            component='th'
                        >
                            {isSortable ? (
                                <TableSortLabel
                                    active={orderBy === accessor}
                                    direction={order || undefined}
                                    onClick={createSortHandler(accessor)}
                                    IconComponent={ArrowDropDownRounded}
                                >
                                    {label}
                                </TableSortLabel>
                            ) : (
                                label
                            )}
                        </StyledHeadCell>
                    );
                })}
            </TableRow>
        </MaterialTableHead>
    );
};

export default memo(TableHead);
