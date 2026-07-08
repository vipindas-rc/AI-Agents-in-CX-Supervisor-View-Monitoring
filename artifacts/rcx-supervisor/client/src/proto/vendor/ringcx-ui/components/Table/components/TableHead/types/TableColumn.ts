export interface ITableColumn {
    label: string;
    accessor: string;
    align?: 'inherit' | 'left' | 'center' | 'right' | 'justify';
    disablePadding?: boolean;
    isSortable?: boolean;
    width?: number | 'auto';
}
