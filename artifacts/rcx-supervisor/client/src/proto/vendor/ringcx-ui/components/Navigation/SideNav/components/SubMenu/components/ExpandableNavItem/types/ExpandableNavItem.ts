import type { PopperProps } from '@material-ui/core/Popper';

import type { INavSubMenu } from '../../../../../types/NavOptions';

export interface IExpandableNavItem {
    menuItem: INavSubMenu;
    currentRoute: string;
    isMoreMenu?: boolean;
    popperProps: Partial<PopperProps>;
}
