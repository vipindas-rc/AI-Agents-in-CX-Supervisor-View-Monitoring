import type { ITableRow } from './';
import type { ITableColumn } from '../components/TableHead/types';

export interface ITableProps {
    columns: ITableColumn[];
    rows: ITableRow[];
    isSelectable?: boolean;
    selectAllLabel?: string;
    virtualScroll?: boolean;
    onSelectAll?: (() => void) | null;
    onSelectRow?: ((rowId: ITableRow['id']) => void) | null;
    onRowClick?: ((rowId: ITableRow['id']) => void) | null;
}
