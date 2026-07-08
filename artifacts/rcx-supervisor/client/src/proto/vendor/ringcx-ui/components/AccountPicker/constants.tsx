import type { GridListAccount, GridListMultiAccount, IColumn } from './types';
import { SortType } from '../../helpers';
import type { GridListColumn } from '../GridList';

export const CHECKBOX_COLUMN_WIDTH = 32;

export const REGULAR_USER_COLUMNS: IColumn[] = [
    {
        label: 'Account name',
        id: 'accountName',
        width: 290,
    },
    {
        label: 'Account ID',
        id: 'accountId',
        width: 140,
        sortAs: 'number',
    },
    {
        label: 'Master ID',
        id: 'mainAccountId',
        width: 140,
        sortAs: 'number',
    },
    {
        label: 'Master name',
        id: 'mainAccountName',
        width: 250,
    },
];

export const SUPERUSER_COLUMNS: IColumn[] = [
    {
        label: 'Account name',
        id: 'accountName',
        width: 215,
    },
    {
        label: 'Account ID',
        id: 'accountId',
        width: 100,
        sortAs: 'number',
    },
    {
        label: 'Master ID',
        id: 'mainAccountId',
        width: 100,
        sortAs: 'number',
    },
    {
        label: 'Master name',
        id: 'mainAccountName',
        width: 125,
    },
    {
        label: 'Shard',
        id: 'databaseShardId',
        width: 75,
    },
    {
        label: 'Dialer ID',
        id: 'defaultIntellidialServerId',
        width: 80,
        sortAs: 'number',
    },
];

export const MULTI_ACCOUNT_COLUMNS: IColumn[] = [
    {
        label: 'Account number',
        id: 'accountId',
        width: 140,
        sortAs: 'number',
    },
    {
        label: 'Account name',
        id: 'accountName',
    },
];
export const GL_REGULAR_USER_COLUMN: GridListColumn<GridListAccount>[] = [
    {
        content: '',
        id: 'checkbox',
    },
    {
        content: 'Account name',
        id: 'accountName',
        sortAs: SortType.STRING,
    },
    {
        content: 'Account ID',
        id: 'accountId',
        sortAs: SortType.NUMBER,
    },
    {
        content: 'Master ID',
        id: 'mainAccountId',
        sortAs: SortType.NUMBER,
    },
    {
        content: 'Master name',
        id: 'mainAccountName',
        sortAs: SortType.STRING,
    },
];

export const GL_SUPERUSER_COLUMNS: GridListColumn<GridListAccount>[] = [
    {
        content: '',
        id: 'checkbox',
    },
    {
        content: 'Account name',
        id: 'accountName',
        sortAs: SortType.STRING,
    },
    {
        content: 'Account ID',
        id: 'accountId',
        sortAs: SortType.NUMBER,
    },
    {
        content: 'Master ID',
        id: 'mainAccountId',
        sortAs: SortType.NUMBER,
    },
    {
        content: 'Master name',
        id: 'mainAccountName',
        sortAs: SortType.STRING,
    },
    {
        content: 'Shard',
        id: 'databaseShardId',
        sortAs: SortType.STRING,
    },
    {
        content: 'Dialer ID',
        id: 'defaultIntellidialServerId',
        sortAs: SortType.STRING,
    },
];
export enum Order {
    ASC = 'asc',
    DESC = 'desc',
    NONE = 'none',
}

export const CHECKBOX_COLUMN = 'checkbox';

export const GL_MULTI_ACCOUNT_COLUMNS: GridListColumn<GridListMultiAccount>[] =
    [
        {
            content: 'Account number',
            id: 'accountId',
            sortAs: SortType.NUMBER,
        },
        {
            content: 'Account name',
            id: 'accountName',
            sortAs: SortType.STRING,
        },
    ];
