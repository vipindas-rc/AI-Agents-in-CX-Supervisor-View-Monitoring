import type { TableCellProps } from '@material-ui/core/TableCell';

export interface IExtendedTableRow extends TableCellProps {
    isDisabled?: boolean;
}
