import type { ITableColumn, ITableRow } from '../../Table';

export const columns: ITableColumn[] = [
    {
        label: 'first',
        accessor: 'col_1',
    },
    {
        label: 'second',
        accessor: 'col_2',
    },
];
export const rows: ITableRow[] = [
    {
        id: '0',
        payload: {
            col_1: 'one',
            col_2: 'two',
        },
    },
    {
        id: '1',
        payload: {
            col_1: 'three',
            col_2: 'four',
        },
    },
    {
        id: 2,
        payload: {
            col_1: 'five',
            col_2: 'six',
        },
    },
];
