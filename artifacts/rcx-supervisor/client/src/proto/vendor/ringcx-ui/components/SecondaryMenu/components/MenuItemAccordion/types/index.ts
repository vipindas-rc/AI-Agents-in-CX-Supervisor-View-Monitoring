import type { MenuItemWithChildren } from '../../../types';

export type MenuAccordion = {
    menuSubItems: MenuItemWithChildren['items'];
    currentLocation: string;
};
