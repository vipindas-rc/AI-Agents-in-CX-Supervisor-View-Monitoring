import type { MouseEventHandler, SyntheticEvent } from 'react';

import type { INavGroup } from './NavOptions';
import type { ISideNav } from './SideNav';

export interface INavIconButton
    extends Pick<ISideNav, 'expanded' | 'showItemTooltip' | 'layout'>,
        Pick<INavGroup, 'renderMenuItemComponent'> {
    icon: INavGroup['icon'];
    label: INavGroup['label'];
    selected: boolean;
    viewing: boolean;
    href?: string;
    badgeContent?: number;
    onClick?: MouseEventHandler<HTMLDivElement>;
    onMouseEnter?: (event: SyntheticEvent) => void;
    onMouseLeave?: (event: SyntheticEvent) => void;
    onKeyDown?: (event: React.KeyboardEvent<HTMLDivElement>) => void;
    onShowTooltip?: () => boolean | void;
}
