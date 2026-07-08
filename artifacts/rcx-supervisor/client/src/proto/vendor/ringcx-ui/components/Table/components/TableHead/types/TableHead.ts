import type { SortDirection } from '@material-ui/core/TableCell';

import type { ITableColumn } from './TableColumn';
import type { ITableProps } from '../../../types';

export interface ITableHeadProps
    extends Pick<
        ITableProps,
        'selectAllLabel' | 'onSelectAll' | 'isSelectable'
    > {
    numSelected: number;
    numDisabled: number;
    rowCount: number;
    columns: ITableColumn[];
    onSort: (fieldId: string) => void;
    order: SortDirection;
    orderBy: string;
}
