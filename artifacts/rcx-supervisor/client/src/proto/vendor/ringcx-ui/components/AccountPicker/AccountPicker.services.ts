import type { GridListAccount, IAccount } from './types';
import type { GridListColumn } from '../GridList';

export function moveCurrentAccountToTop(
    accounts: GridListAccount[],
    currentAccount: GridListAccount | null
): GridListAccount[] {
    if (currentAccount) {
        const filteredAccountList = accounts.filter(
            (item) => item.accountId !== currentAccount.accountId
        );

        if (filteredAccountList.length !== accounts.length) {
            filteredAccountList.unshift(currentAccount);
        }

        return filteredAccountList;
    }

    return accounts;
}

export function getSearchableFields(
    columns: GridListColumn<GridListAccount>[]
): (keyof GridListAccount)[] {
    return columns.map((column) => column.id as keyof GridListAccount);
}

export function searchAccounts(
    accounts: GridListAccount[],
    currentAccount: GridListAccount | null,
    searchableFields: (keyof GridListAccount)[],
    value: string
): GridListAccount[] {
    const result = accounts.filter((account) => {
        for (const [key, field] of Object.entries(account)) {
            if (searchableFields.indexOf(key as keyof IAccount) !== -1) {
                const fieldValue = String(field).toUpperCase();
                const verifyingValue = value.toUpperCase();
                if (fieldValue.indexOf(verifyingValue) !== -1) {
                    return true;
                }
            }
        }

        return false;
    });
    return currentAccount
        ? moveCurrentAccountToTop(result, currentAccount)
        : result;
}
