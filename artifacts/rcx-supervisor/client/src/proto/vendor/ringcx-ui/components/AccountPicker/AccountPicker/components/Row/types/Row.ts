import type { GridListColumn } from '../../../../../GridList';
import type { GridListAccount } from '../../../../types';

export interface IRow {
    data: GridListAccount;
    columns: GridListColumn<GridListAccount>[];
    isSuperUser: boolean;
    isChecked: boolean;
    onSelectAccount: (account: GridListAccount) => void;
}
