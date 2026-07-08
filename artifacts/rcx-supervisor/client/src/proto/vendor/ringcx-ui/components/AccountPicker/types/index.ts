import type { ReactNode } from 'react';

import type { i18n } from 'i18next';

import type { GridListColumn, RenderRowOneRowData } from '../../GridList';
import type { Order } from '../constants';

export interface IAccountPicker {
    isSuperUser: boolean;
    currentAccount: IAccount;
    accounts: IAccount[];

    changeSubAccount(acc: GridListAccount): void;

    dialogTitle: string;
    container?: HTMLElement;
    superUserColumns?: GridListColumn<GridListAccount>[];
    userColumns?: GridListColumn<GridListAccount>[];
    searchTitle?: string;
    i18n?: i18n;
    listAriaLabel?: string;
}

export interface IMultiAccountPicker {
    alreadyAddedAccounts: IAccount[];
    accounts: ISelectableAccount[];
    accountColumns?: GridListColumn<GridListMultiAccount>[];

    addAccounts(accounts: GridListMultiAccount[]): void;

    dialogTitle: string;
    cancelTitle?: string;
    addAccountsTitle?: string;
    hideAddedAccountsTitle?: string;
    searchTitle: string;
    open: boolean;

    onClose(): void;

    container?: HTMLElement;
    selectAllAccountsAriaLabel?: string;
    selectRowForAccountAriaLabel?: (accountId: string) => string;
    listAriaLabel?: string;
}

export interface IAccount {
    mainAccountId: string;
    accountId: string;
    accountName: string;
    enableMultiUser?: boolean;
    enableSoftphones: boolean;
    tcpaSafeMode: boolean;
    enableVoiceBroadcast: boolean;
    enable247Dialing: boolean;
    enableChat: boolean;
    enableOutbound: boolean;
    enableInbound: boolean;
    enableTracking: boolean;
    enableVisualIvr: boolean;
    enableGoodData: boolean;
    enableCloudRouting: boolean;
    usePowerBy?: boolean;
    enableAgentRankRouting: boolean;
    enableHciDialer: boolean;
    enableTcpaSafeMachineDetect: boolean;
    emailFromAddress: string;
    databaseShardId: string;
    defaultIntellidialServerId: number;
    mainAccountName: string;
    rcAccountAccess: string;
}

export interface IUser {
    id: number;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    rcUserId?: number;
    roles: IRole[];
    sso: boolean;
}

export interface IRole {
    roleType: string;
    description: string;
}

export type OrderBy = keyof IAccount;

export interface ITableHead {
    columns: IColumn[];
    order?: Order;
    orderBy?: OrderBy;

    onSort(property: keyof IAccount, sortAs?: IColumn['sortAs']): void;

    isSortEnabled: boolean;
    checkboxColumn: ReactNode;
}

export interface IColumn {
    id: keyof IAccount;
    label: string;
    width?: number;
    selected?: boolean;
    component?: ReactNode;
    sortAs?: 'number' | 'string';
}

export interface ICheckedTableRow {
    checked: boolean;
    disabled?: boolean;
}

export type GridListAccount = RenderRowOneRowData<IAccount>;

export interface ISelectableAccount extends IAccount {
    selected?: boolean;
    disabled?: boolean;
    visible?: boolean;
}

export type GridListMultiAccount = RenderRowOneRowData<ISelectableAccount>;
