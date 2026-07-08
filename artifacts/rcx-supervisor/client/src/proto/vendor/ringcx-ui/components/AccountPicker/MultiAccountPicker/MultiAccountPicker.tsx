import type { ChangeEvent, FC } from 'react';
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { Row } from './components/row';
import {
    StyledBody,
    StyledCheckBoxWrapper,
    StyledDialogActions,
    StyledMultiHeader,
    StyledSearchInputWrapper,
    StyleGridList,
} from './MultiAccountPicker.styled';
import { TEST_AID } from '../../../constants';
import { useDebounce } from '../../../hooks';
import { Button } from '../../Button';
import Checkbox from '../../Checkbox';
import SearchInput from '../../Inputs/SearchInput/SearchInput';
import { getSearchableFields, searchAccounts } from '../AccountPicker.services';
import { StyledDialog } from '../AccountPicker.styled';
import { GL_MULTI_ACCOUNT_COLUMNS } from '../constants';
import type { GridListMultiAccount, IMultiAccountPicker } from '../types';

const MultiAccountPicker: FC<IMultiAccountPicker> = ({
    accounts,
    container,
    alreadyAddedAccounts,
    accountColumns = GL_MULTI_ACCOUNT_COLUMNS,
    addAccountsTitle = 'Add accounts',
    cancelTitle = 'Cancel',
    dialogTitle = 'Account picker',
    hideAddedAccountsTitle = 'Hide added accounts',
    searchTitle = 'Search',
    addAccounts,
    open,
    onClose,
    selectAllAccountsAriaLabel,
    selectRowForAccountAriaLabel,
    listAriaLabel = '',
}) => {
    const gridListAccounts: GridListMultiAccount[] = useMemo(
        () =>
            accounts.map((account) => ({
                ...account,
                glId: account.accountId,
            })),
        [accounts]
    );
    const tableContainerRef = useRef<HTMLDivElement>(null);

    const [visibleData, setVisibleData] =
        useState<GridListMultiAccount[]>(gridListAccounts);
    const [allAccounts, setAllAccounts] =
        useState<GridListMultiAccount[]>(gridListAccounts);
    const [searchedAccounts, setSearchedAccounts] = useState<
        GridListMultiAccount[]
    >([]);
    const [selectAllChecked, setSelectAllChecked] = useState<0 | 1 | 2>(0); // 0 = unchecked, 1 = checked, 2 = indeterminate
    const [searchValue, setSearchValue] = useState<string>('');
    const [hideAddedAccounts, setHideAddedAccounts] = useState<boolean>(false);
    const [withBorder, setWithBorder] = useState<boolean>(false);

    const onSelectAll = useCallback(() => {
        const isChecked = selectAllChecked === 0 ? 1 : 0;
        setSelectAllChecked(isChecked);
        const updatedAccounts = [...allAccounts];
        updatedAccounts.forEach((account) => {
            account.selected =
                account.visible && !account.disabled
                    ? isChecked === 1
                    : account.selected;
        });
        setAllAccounts(updatedAccounts);
    }, [selectAllChecked, allAccounts]);

    const onSelectAccount = useCallback(
        (selectedAccount: GridListMultiAccount) => {
            selectedAccount.selected = !selectedAccount.selected;
            const updatedAccounts = [...allAccounts].map((account) =>
                account.accountId === selectedAccount.accountId
                    ? { ...account, selected: selectedAccount.selected }
                    : account
            );
            setAllAccounts(updatedAccounts);
        },
        [allAccounts]
    );

    const onChangeSearch = useCallback((value: string) => {
        setSearchValue(value);
    }, []);

    const onClearSearch = useCallback(() => {
        setSearchValue('');
    }, []);

    const onExit = useCallback(() => {
        onClearSearch();
        setSelectAllChecked(0);
        setHideAddedAccounts(false);
        const updatedAccounts = [...allAccounts];
        updatedAccounts.forEach((account) => {
            account.visible = true;
            account.selected = false;
        });
        setAllAccounts(updatedAccounts);
    }, [allAccounts, onClearSearch]);

    const onClosingGetSelectedNotDisabledAccounts =
        useCallback((): GridListMultiAccount[] => {
            return allAccounts.filter(
                (account) => account.selected && !account.disabled
            );
        }, [allAccounts]);

    const onSearch = useCallback(
        (searchValue: string) => {
            setAllAccounts((allAccounts) => {
                const searchMatchedAccounts = searchAccounts(
                    allAccounts,
                    null,
                    getSearchableFields(accountColumns),
                    searchValue
                );
                setSearchedAccounts(searchMatchedAccounts);
                const updatedAccounts = [...allAccounts];

                updatedAccounts.forEach((account) => {
                    account.visible = searchMatchedAccounts.some(
                        (searchMatchedAccount) => {
                            const doAccountsMatch =
                                searchMatchedAccount.accountId ===
                                account.accountId;
                            const isAccountBeingHidden =
                                account.disabled && hideAddedAccounts;

                            return doAccountsMatch && !isAccountBeingHidden;
                        }
                    );
                });
                return updatedAccounts;
            });
        },
        [accountColumns, hideAddedAccounts]
    );

    const onEntered = useCallback(() => {
        if (tableContainerRef.current) {
            const { clientHeight, scrollHeight } = tableContainerRef.current;
            if (clientHeight < scrollHeight) {
                setWithBorder(true);
            }
        }
    }, []);

    //Used on first render to set all 'alreadyAddedAccounts' to disabled and all accounts to visible
    useEffect(() => {
        gridListAccounts.forEach((account) => {
            account.visible = true;
            account.disabled = alreadyAddedAccounts.some(
                (alreadyAddedAccount) =>
                    alreadyAddedAccount.accountId === account.accountId
            );
        });
        setAllAccounts(gridListAccounts);
    }, [alreadyAddedAccounts, gridListAccounts]);

    //Logic for "Hide added accounts" checkbox
    const setHideAddedAccountsOnAllAccounts = useCallback(
        (value: boolean) => {
            const updatedAccounts = [...allAccounts];

            updatedAccounts.forEach((account) => {
                if (searchValue !== '') {
                    const isAccountInSearchedAccounts = searchedAccounts.some(
                        (searchedAccount) =>
                            account.accountId === searchedAccount.accountId
                    );
                    account.visible =
                        isAccountInSearchedAccounts &&
                        !(account.disabled && value);
                } else {
                    account.visible = !(account.disabled && value);
                }
            });
            setAllAccounts(updatedAccounts);
        },
        [allAccounts, setAllAccounts, searchedAccounts, searchValue]
    );

    //Keep visibleData in sync with allAccounts
    useEffect(() => {
        const visibleAccounts = allAccounts.filter(
            (account) => account.visible
        );
        setVisibleData(visibleAccounts);
    }, [allAccounts]);

    //Logic to determine the state of selectAllChecked
    useEffect(() => {
        const isEveryAccountSelected = visibleData.every(
            (account) => account.selected || account.disabled
        );
        const isEveryAccountUnSelected = visibleData.every(
            (account) => !account.selected || account.disabled
        );

        if (!isEveryAccountSelected && !isEveryAccountUnSelected) {
            setSelectAllChecked(2);
        } else if (isEveryAccountSelected) {
            setSelectAllChecked(1);
        } else {
            setSelectAllChecked(0);
        }
    }, [visibleData]);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const onSearchDebounce = useDebounce(onSearch);

    useEffect(() => {
        onSearchDebounce(searchValue);
    }, [onSearchDebounce, searchValue]);

    const GL_CHECKBOX_HEADER = useMemo(() => {
        return {
            id: 'checkbox',
            content: (
                <label
                    data-aid={TEST_AID.MULTI_ACCOUNT_HEADER_CHECKBOX_LABEL}
                    htmlFor={'checkbox'}
                >
                    <Checkbox
                        inputProps={{
                            'aria-label': selectAllAccountsAriaLabel,
                        }}
                        id='checkbox'
                        data-aid={TEST_AID.MULTI_ACCOUNT_HEADER_CHECKBOX}
                        {...{
                            checked: selectAllChecked === 1,
                            onChange: onSelectAll,
                            indeterminate: selectAllChecked === 2,
                        }}
                    />
                </label>
            ),
        };
    }, [onSelectAll, selectAllChecked]);

    const renderRow = useCallback(
        (data: GridListMultiAccount) => {
            return (
                <Row
                    selectRowForAccountAriaLabel={selectRowForAccountAriaLabel}
                    data={data}
                    onSelect={onSelectAccount}
                />
            );
        },
        [onSelectAccount]
    );

    return (
        <StyledDialog
            open={open}
            onClose={onClose}
            onEntered={onEntered}
            onExited={onExit}
            dialogTitle={dialogTitle}
            container={container}
            disableBackdropClick={true}
            content={
                <Fragment>
                    <StyledMultiHeader>
                        <StyledSearchInputWrapper>
                            <SearchInput
                                value={searchValue}
                                placeholder={searchTitle}
                                onChange={onChangeSearch}
                                autoFocus
                            />
                        </StyledSearchInputWrapper>
                        <StyledCheckBoxWrapper>
                            <Checkbox
                                checked={hideAddedAccounts}
                                onChange={(
                                    e: ChangeEvent<HTMLElement>,
                                    value: boolean
                                ) => {
                                    setHideAddedAccounts(value);
                                    setHideAddedAccountsOnAllAccounts(value);
                                }}
                                label={hideAddedAccountsTitle}
                            />
                        </StyledCheckBoxWrapper>
                    </StyledMultiHeader>
                    <StyledBody>
                        <StyleGridList<GridListMultiAccount>
                            {...{
                                listAriaLabel,
                                columns: [
                                    GL_CHECKBOX_HEADER,
                                    ...accountColumns,
                                ],
                                data: visibleData,
                                renderRow,
                            }}
                        />
                    </StyledBody>
                    <StyledDialogActions withBorder={withBorder}>
                        <Button
                            key='cancel'
                            variant='text'
                            color='primary'
                            onClick={onClose}
                        >
                            {cancelTitle}
                        </Button>
                        <Button
                            key='addAccounts'
                            onClick={() => {
                                addAccounts(
                                    onClosingGetSelectedNotDisabledAccounts()
                                );
                                onClose();
                            }}
                        >
                            {addAccountsTitle}
                        </Button>
                    </StyledDialogActions>
                </Fragment>
            }
        />
    );
};

export default MultiAccountPicker;
