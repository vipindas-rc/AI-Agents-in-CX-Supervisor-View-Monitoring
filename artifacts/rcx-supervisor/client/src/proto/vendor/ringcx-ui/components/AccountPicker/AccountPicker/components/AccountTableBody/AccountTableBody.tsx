import type { FC } from 'react';
import { useCallback } from 'react';

import type { IAccountTableBody } from './types';
import CheckedTableCell from '../../../components/CheckedTableCell';
import {
    StyledTable,
    StyledTableBody,
    StyledTableBodyRow,
    StyledTableCell,
} from '../../../components/StyledAccountTable.styled';
import { CHECKBOX_COLUMN_WIDTH } from '../../../constants';
import type { IAccount } from '../../../types';

const AccountTableBody: FC<IAccountTableBody> = ({
    columns,
    accounts,
    currentAccount,
    onSelectAccount,
}) => {
    const onTableRowClick = useCallback(
        (account: IAccount) => () => onSelectAccount(account),
        [onSelectAccount]
    );

    return (
        <StyledTable>
            <colgroup>
                <col width={CHECKBOX_COLUMN_WIDTH} />
                {columns.map(({ width, id }) => {
                    return <col key={id} width={width} />;
                })}
            </colgroup>
            <StyledTableBody>
                {accounts.map((account: IAccount) => {
                    const isCurrentAccount =
                        currentAccount.accountId === account.accountId;

                    return (
                        <StyledTableBodyRow
                            key={account.accountId}
                            onClick={onTableRowClick(account)}
                            checked={isCurrentAccount}
                        >
                            <CheckedTableCell checked={isCurrentAccount} />

                            {Object.values(columns).map(({ id }) => (
                                <StyledTableCell key={id}>
                                    {account[id]}
                                </StyledTableCell>
                            ))}
                        </StyledTableBodyRow>
                    );
                })}
            </StyledTableBody>
        </StyledTable>
    );
};

export default AccountTableBody;
