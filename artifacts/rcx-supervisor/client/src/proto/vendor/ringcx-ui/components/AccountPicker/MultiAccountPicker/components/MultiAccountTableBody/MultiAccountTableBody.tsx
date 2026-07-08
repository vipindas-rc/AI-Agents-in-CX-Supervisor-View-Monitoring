import type { FC, PropsWithChildren } from 'react';
import { useCallback } from 'react';

import { StyledColoredTableCell } from './MultiAccountTableBody.styled';
import type { IMultiSelectAccountTableBody, ISelectableAccount } from './types';
import Checkbox from '../../../../../components/Checkbox';
import CheckedTableCell from '../../../components/CheckedTableCell';
import { StyledCheckedTableCell } from '../../../components/CheckedTableCell/CheckedTableCell.styled';
import {
    StyledTable,
    StyledTableBody,
    StyledTableBodyRow,
    StyledTableCell,
} from '../../../components/StyledAccountTable.styled';
import { CHECKBOX_COLUMN_WIDTH } from '../../../constants';
import type { IAccount } from '../../../types';

const MultiAccountTableBody: FC<
    PropsWithChildren<IMultiSelectAccountTableBody>
> = ({ columns, accounts, onSelectAccount }) => {
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
                {accounts.map((account: ISelectableAccount) => {
                    return (
                        <StyledTableBodyRow
                            key={account.accountId}
                            onClick={onTableRowClick(account)}
                            checked={!account.disabled && !!account.selected}
                            disabled={account.disabled}
                        >
                            {account.disabled ? (
                                <CheckedTableCell
                                    checked={account.disabled}
                                    disabled={true}
                                />
                            ) : (
                                <StyledCheckedTableCell>
                                    <Checkbox
                                        checked={!!account.selected}
                                        onChange={() =>
                                            onTableRowClick(account)
                                        }
                                    />
                                </StyledCheckedTableCell>
                            )}
                            {Object.values(columns).map(({ id }) => (
                                <StyledTableCell key={id}>
                                    <StyledColoredTableCell
                                        disabled={account.disabled}
                                    >
                                        {account[id]}
                                    </StyledColoredTableCell>
                                </StyledTableCell>
                            ))}
                        </StyledTableBodyRow>
                    );
                })}
            </StyledTableBody>
        </StyledTable>
    );
};

export default MultiAccountTableBody;
