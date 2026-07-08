import type { ReactNode } from 'react';

export interface IMenuItemLink {
    title: string;
    to: string;
    isExternal?: boolean;
    onClick?: () => void;
}

export interface IMenuItemComponent {
    component: ReactNode;
}

export type IMenuItem = IMenuItemLink | IMenuItemComponent;

export interface IUserItems {
    items: IMenuItem[];
}

export function isMenuItemLink(item: IMenuItem): item is IMenuItemLink {
    return (item as IMenuItemLink).title !== undefined;
}

export function isMenuItemComponent(
    item: IMenuItem
): item is IMenuItemComponent {
    return (item as IMenuItemComponent).component !== undefined;
}
