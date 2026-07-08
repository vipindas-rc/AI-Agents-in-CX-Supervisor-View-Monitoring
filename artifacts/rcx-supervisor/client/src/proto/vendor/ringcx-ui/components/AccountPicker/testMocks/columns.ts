import type { GridListColumn } from '../../../components/GridList';
import type { GridListAccount } from '../types';

export const TEST_USER_COLUMNS: GridListColumn<GridListAccount>[] = [
    { content: 'Account name', id: 'accountName' },
    { content: 'Account ID', id: 'accountId' },
];
export const TEST_SEARCHABLE_USER_COLUMNS: (keyof GridListAccount)[] = [
    'accountName',
    'accountId',
];

export const TEST_SUPERUSER_COLUMNS: GridListColumn<GridListAccount>[] = [
    ...TEST_USER_COLUMNS,
    { content: 'Master ID', id: 'mainAccountId' },
    { content: 'Master name', id: 'mainAccountName' },
];
export const TEST_SEARCHABLE_SUPERUSER_COLUMNS: (keyof GridListAccount)[] = [
    ...TEST_SEARCHABLE_USER_COLUMNS,
    'mainAccountId',
    'mainAccountName',
];
