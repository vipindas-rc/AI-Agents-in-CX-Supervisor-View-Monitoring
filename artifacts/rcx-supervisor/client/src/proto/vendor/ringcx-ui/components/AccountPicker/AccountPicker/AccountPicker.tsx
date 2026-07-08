import type { FC } from 'react';
import { Fragment, useCallback, useMemo, useState } from 'react';

import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';

import {
    HeaderColumnWrapper,
    StyledAccountToggle,
    StyledBody,
    StyledGridList,
} from './AccountPicker.styled';
import { Row } from './components/Row';
import { TEST_AID } from '../../../constants';
import { i18next } from '../../../services/translate';
import type {
    GridListColumn,
    GridListType,
    RenderRowsData,
} from '../../GridList';
import SearchInput from '../../Inputs/SearchInput/SearchInput';
import { TextEclipse } from '../../TextEclipse';
import {
    getSearchableFields,
    moveCurrentAccountToTop,
    searchAccounts,
} from '../AccountPicker.services';
import {
    NoMatchesFound,
    StyledDialog,
    StyledHeader,
} from '../AccountPicker.styled';
import { GL_REGULAR_USER_COLUMN, GL_SUPERUSER_COLUMNS } from '../constants';
import type { GridListAccount, IAccountPicker } from '../types';

const wrapColumnHeadersWithTextEclipse = (
    columns: GridListColumn<GridListAccount>[],
    t: TFunction<'translation', undefined>
) => {
    return columns.map((column) => {
        return {
            ...column,
            content: (
                <TextEclipse
                    tooltipMsg={t(column.content as string)}
                    popperProps={{
                        disablePortal: true,
                    }}
                >
                    <HeaderColumnWrapper>
                        {t(column.content as string)}
                    </HeaderColumnWrapper>
                </TextEclipse>
            ),
        };
    });
};

const AccountPicker: FC<IAccountPicker> = ({
    currentAccount,
    accounts,
    isSuperUser = false,
    changeSubAccount,
    dialogTitle = 'Account picker',
    container,
    superUserColumns = GL_SUPERUSER_COLUMNS,
    userColumns = GL_REGULAR_USER_COLUMN,
    searchTitle = 'Search',
    i18n = i18next,
    listAriaLabel = '',
}) => {
    const [isOpen, setOpen] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const { t } = useTranslation(undefined, { i18n });

    const togglePicker = useCallback(() => {
        setOpen((prevValue) => !prevValue);
    }, []);

    const gridListAccounts: GridListAccount[] = useMemo(
        () =>
            accounts.map((account) => ({
                ...account,
                glId: account.accountId,
            })),
        [accounts]
    );

    const gridListCurrentAccount: GridListAccount = useMemo(
        () => ({
            ...currentAccount,
            glId: currentAccount.accountId,
        }),
        [currentAccount]
    );
    const defaultAccounts = useMemo<GridListAccount[]>(
        () => moveCurrentAccountToTop(gridListAccounts, gridListCurrentAccount),
        [gridListAccounts, gridListCurrentAccount]
    );

    const columns = useMemo<GridListColumn<GridListAccount>[]>(
        () =>
            isSuperUser
                ? wrapColumnHeadersWithTextEclipse(superUserColumns, t)
                : wrapColumnHeadersWithTextEclipse(userColumns, t),
        [isSuperUser, superUserColumns, userColumns, t]
    );

    const onExited = useCallback(() => {
        setSearchValue('');
    }, []);

    const onSelectAccount = useCallback(
        (account: GridListAccount) => {
            if (currentAccount.accountId !== account.accountId) {
                changeSubAccount(account);
                togglePicker();
            }
        },
        [currentAccount, changeSubAccount, togglePicker]
    );

    const onChangeSearch = useCallback((value: string) => {
        setSearchValue(value);
    }, []);

    const renderRow = useCallback(
        (data: GridListAccount) => (
            <Row
                {...{
                    isSuperUser,
                    data,
                    columns,
                    isChecked: currentAccount.accountId === data.accountId,
                    onSelectAccount,
                }}
            />
        ),
        [columns, currentAccount, isSuperUser, onSelectAccount]
    );

    const renderEmptyFilterResult = useCallback(
        () => <NoMatchesFound data-aid={TEST_AID.NO_MATCH_FOUND} />,
        []
    );

    const handleFiltration = useCallback(
        (
            data: RenderRowsData<GridListAccount>
        ): [RenderRowsData<GridListAccount>] => {
            return [
                searchAccounts(
                    data,
                    gridListCurrentAccount,
                    getSearchableFields(columns),
                    searchValue
                ),
            ];
        },
        [gridListCurrentAccount, searchValue, columns]
    );

    return (
        <Fragment>
            <StyledAccountToggle
                onClick={togglePicker}
                data-aid={TEST_AID.ACCOUNT_PICKER}
            >
                {currentAccount.accountName}
            </StyledAccountToggle>
            <StyledDialog
                open={isOpen}
                onClose={togglePicker}
                onExited={onExited}
                dialogTitle={dialogTitle}
                container={container}
                disableBackdropClick={true}
                content={
                    <Fragment>
                        <StyledHeader>
                            <SearchInput
                                value={searchValue}
                                placeholder={searchTitle}
                                onChange={onChangeSearch}
                                autoFocus
                            />
                        </StyledHeader>

                        <StyledBody>
                            <StyledGridList<
                                FC<
                                    {
                                        isSuperUser?: boolean;
                                        disableDefaultCheckedHighlight?: boolean;
                                    } & GridListType<GridListAccount>
                                >
                            >
                                data={defaultAccounts}
                                columns={columns}
                                renderRow={renderRow}
                                isSuperUser={isSuperUser}
                                filtrationCallback={handleFiltration}
                                renderEmptyFilterResult={
                                    renderEmptyFilterResult
                                }
                                listAriaLabel={listAriaLabel}
                            />
                        </StyledBody>
                    </Fragment>
                }
            />
        </Fragment>
    );
};

export default AccountPicker;
