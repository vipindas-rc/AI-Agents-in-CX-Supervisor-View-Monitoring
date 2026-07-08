import type { GridListMultiAccount } from '../../../../types';

export interface IRow {
    data: GridListMultiAccount;
    onSelect: (account: GridListMultiAccount) => void;
    selectRowForAccountAriaLabel?: (accountName: string) => string;
}
