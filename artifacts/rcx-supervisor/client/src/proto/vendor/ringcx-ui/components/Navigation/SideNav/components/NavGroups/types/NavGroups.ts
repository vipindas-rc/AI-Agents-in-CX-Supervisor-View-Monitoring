import type { ISideNav, VisibleNavGroup } from '../../../types/SideNav';

export interface INavGroups
    extends Pick<ISideNav, 'navItems' | 'expanded' | 'showItemTooltip'> {
    visibleNavGroup: VisibleNavGroup;
    currentRoute: string;
    debounceToggle(isOpen: boolean, section?: VisibleNavGroup): void;
    displayDividers?: boolean;
}
