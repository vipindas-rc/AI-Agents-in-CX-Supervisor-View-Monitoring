import type { MouseEvent, ReactNode } from 'react';

import type { IAccount } from '../../AccountPicker';
import type { LabelsType } from '../../AppSwitcher';
import type { IUserMenu } from '../components/UserMenu/types/UserMenu';

export type AccessibilityLabels = {
    menuHamburger: { collapse: string; expand: string };
    appSwitcher: { open: string; close: string };
};

export interface ITopPanel {
    mainAccountId?: IAccount['mainAccountId'];
    subAccountId?: IAccount['accountId'];
    defaultLogo: string;
    logoOnClick?(event?: MouseEvent): void;
    isOpenMenu?: boolean;
    toggleMenuCallback?(event?: MouseEvent): void;
    userMenuData?: IUserMenu | null;
    disableAppSwitcher?: boolean;
    disableActions?: boolean;
    loading?: boolean;
    rcAccountId?: string;
    appSwitcherLabels?: LabelsType;
    isCRMScreen?: boolean;
    onTrackAnalytics?: (event: string, property?: any) => void;
    portalType?: number;
    onWEMNotConfigured?: () => void;
    accessibilityLabels?: Partial<AccessibilityLabels>;
    shouldShowLeftMenuAndHeader?: boolean;
    rightActions?: ReactNode;
}
