import type { IAccount, IColumn } from '../../../../types';

export interface IAccountTableBody {
    columns: IColumn[];
    accounts: IAccount[];
    currentAccount: IAccount;
    onSelectAccount: (account: IAccount) => void;
}
