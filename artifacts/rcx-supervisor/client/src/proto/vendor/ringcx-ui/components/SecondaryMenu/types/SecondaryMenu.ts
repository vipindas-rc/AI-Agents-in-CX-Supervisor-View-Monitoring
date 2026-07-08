import type { ReactNode } from 'react';

export interface MenuItemWithNoChildren {
    id: string;
    url: string;
    label: ReactNode;
}

export interface MenuItemWithChildren {
    id: string;
    label: string;
    items: MenuItemWithNoChildren[];
}

export type MenuItemFirstLevel =
    | MenuItemWithChildren
    | MenuItemWithNoChildren
    | typeof SecondaryMenuItemDelimiter;

export type MenuItems = MenuItemFirstLevel[];

export type SecondaryMenuType = {
    currentLocation: string;
    menuItems: MenuItems;
};

export function isMenuItemWIthChildren(
    menuItem: MenuItemFirstLevel
): menuItem is MenuItemWithChildren {
    return (menuItem as MenuItemWithChildren).items !== undefined;
}

export function isMenuItemWithNoChildren(
    menuItem: MenuItemFirstLevel
): menuItem is MenuItemWithNoChildren {
    const { url } = menuItem as MenuItemWithNoChildren;
    return typeof url === 'string';
}

export function isLabelComponent(
    label: string | Element | ReactNode
): label is Element | ReactNode {
    return (typeof label as Element | ReactNode) !== 'string';
}

export function isDelimiter(
    menuItem: MenuItemFirstLevel
): menuItem is typeof SecondaryMenuItemDelimiter {
    return menuItem === SecondaryMenuItemDelimiter;
}

export const SecondaryMenuItemDelimiter = Symbol.for(
    '@engage-ui/SecondaryMenuItemDelimiter'
);
