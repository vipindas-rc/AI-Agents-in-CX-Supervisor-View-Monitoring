import type { MouseEventHandler, PropsWithChildren } from 'react';

interface INavBase {
    label: string;
    translationKey?: string;
    route?: string;
    renderMenuItemComponent?: (
        props: PropsWithChildren<Record<string, unknown>>
    ) => JSX.Element;
    disabled?: boolean;
}

export interface INavGroup extends INavBase {
    icon?: JSX.Element;
    iconRight?: JSX.Element;
    divider?: boolean;
    header?: string;
    children?: Array<INavChild | INavGroup>;
    mergeChildren?: boolean;
    unreadCount?: number;
    onClick?: MouseEventHandler<HTMLDivElement>;
    enableAccessibility?: boolean;
}

export type INavSubGroup = Pick<INavGroup, 'label' | 'disabled' | 'children'>;

export type INavOption = INavGroup;

export interface INavSubMenu extends INavBase {
    children: INavOption[];
    onClick: () => void;
}

export type INavChild = (INavSubGroup | INavSubMenu | INavOption) & {
    onClick?: MouseEventHandler<HTMLDivElement>;
};
