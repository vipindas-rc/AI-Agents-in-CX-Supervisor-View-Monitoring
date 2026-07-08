import type { FC } from 'react';
import { Fragment } from 'react';

import SortIcon from './components/SortIcon';
import {
    Label,
    LabelText,
    LabelHover,
    StyledTableHeadCell,
    StyledTableHead,
} from './EnhancedTableHead.styled';
import { TextEclipse } from '../../../TextEclipse';
import { CHECKBOX_COLUMN_WIDTH, Order } from '../../constants';
import type { IAccount, IColumn, ITableHead } from '../../types';
import { StyledTable, StyledTableRow } from '../StyledAccountTable.styled';

const EnhancedTableHead: FC<ITableHead> = ({
    order = Order.NONE,
    orderBy,
    onSort,
    columns,
    isSortEnabled,
    checkboxColumn,
}) => {
    const createSortHandler =
        (property: keyof IAccount, sortAs?: IColumn['sortAs']) => () => {
            onSort(property, sortAs);
        };

    const WrapLabel = isSortEnabled ? LabelHover : Fragment;

    return (
        <StyledTable>
            <colgroup>
                <col width={CHECKBOX_COLUMN_WIDTH} />
                {columns.map(({ width, id }) => {
                    return <col key={id} width={width} />;
                })}
            </colgroup>
            <StyledTableHead>
                <StyledTableRow>
                    {checkboxColumn}
                    {columns.map((column) => (
                        <StyledTableHeadCell
                            key={column.id}
                            isSortEnabled={isSortEnabled}
                        >
                            <WrapLabel
                                onClick={createSortHandler(
                                    column.id,
                                    column.sortAs
                                )}
                            >
                                <Label width={column.width}>
                                    <TextEclipse
                                        tooltipMsg={column.label}
                                        popperProps={{
                                            disablePortal: true,
                                        }}
                                    >
                                        <LabelText>{column.label}</LabelText>
                                    </TextEclipse>
                                    <SortIcon
                                        {...{
                                            order:
                                                orderBy === column.id
                                                    ? order
                                                    : Order.NONE,
                                            isSortEnabled,
                                        }}
                                    />
                                </Label>
                            </WrapLabel>
                        </StyledTableHeadCell>
                    ))}
                </StyledTableRow>
            </StyledTableHead>
        </StyledTable>
    );
};

export default EnhancedTableHead;
