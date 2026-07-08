import type { IAccount, IColumn } from '../../../../types';

export interface IMultiSelectAccountTableBody {
    columns: IColumn[];
    accounts: ISelectableAccount[];
    onSelectAccount: (account: ISelectableAccount) => void;
    selectAllChecked: 0 | 1 | 2;
    onSelectAll: () => void;
    hideAddedAccounts: boolean;
}

export interface ISelectableAccount extends IAccount {
    selected?: boolean;
    disabled?: boolean;
    visible?: boolean;
}
