import type { JSXElementConstructor } from 'react';

import type { INavGroups } from './NavGroups';
import type { INavGroup } from './NavOptions';
export interface ISideNav {
    currentRoute: string;
    expanded: boolean;
    navItems: INavGroup[];
    showItemTooltip?: boolean;
    navGroupElement?: JSXElementConstructor<INavGroups>;
    moreMenuLabel?: string;
    renames?: {
        [key: string]: string[];
    };
    layout?: 'vertical' | 'horizontal';
    showSubMenuHeader?: boolean;
}

export type VisibleNavGroup = INavGroup | null;
