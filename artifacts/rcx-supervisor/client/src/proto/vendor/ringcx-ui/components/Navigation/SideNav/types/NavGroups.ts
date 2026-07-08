import type { ISideNav, VisibleNavGroup } from './SideNav';

export interface INavGroups
    extends Pick<
        ISideNav,
        'navItems' | 'expanded' | 'showItemTooltip' | 'layout'
    > {
    visibleNavGroup: VisibleNavGroup;
    currentRoute: string;
    debounceToggle(isOpen: boolean, section?: VisibleNavGroup): void;
    displayDividers?: boolean;
}
