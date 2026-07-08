import type { IRowData } from './RowData';
import type { ITableProps } from '../../../types';
import type { ITableColumn } from '../../TableHead/types';

export interface ITableRow {
    id: string | number;
    isDisabled?: boolean;
    isSelected?: boolean;
    payload: IRowData;
}

export interface ITableRowProps
    extends ITableRow,
        Pick<ITableProps, 'onRowClick' | 'onSelectRow'> {
    isSelectable: boolean;
    columns: ITableColumn[];
}
