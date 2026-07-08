import type { ISideNav, VisibleNavGroup } from '../../../types/SideNav';

export interface ISubMenu
    extends Pick<ISideNav, 'expanded' | 'layout' | 'showSubMenuHeader'> {
    visibleNavGroup: VisibleNavGroup;
    showSubMenu: boolean;
    currentRoute: string;
    isMoreMenu?: boolean;
    isSalesforceCRMAdminClient?: boolean;
}
