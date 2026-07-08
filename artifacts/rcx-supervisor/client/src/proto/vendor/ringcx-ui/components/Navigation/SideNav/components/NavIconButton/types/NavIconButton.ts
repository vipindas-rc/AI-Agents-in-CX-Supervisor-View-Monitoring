import type { SyntheticEvent } from 'react';

import type { INavGroup } from '../../../types/NavOptions';
import type { ISideNav } from '../../../types/SideNav';

export interface INavIconButton
    extends Pick<ISideNav, 'expanded' | 'showItemTooltip' | 'layout'>,
        Pick<INavGroup, 'renderMenuItemComponent'> {
    icon: INavGroup['icon'];
    label: INavGroup['label'];
    selected: boolean;
    viewing: boolean;
    href?: string;
    badgeContent?: number;
    onClick?: () => void;
    onMouseEnter?: (event: SyntheticEvent) => void;
    onMouseLeave?: (event: SyntheticEvent) => void;
    onShowTooltip?: () => boolean | void;
}
