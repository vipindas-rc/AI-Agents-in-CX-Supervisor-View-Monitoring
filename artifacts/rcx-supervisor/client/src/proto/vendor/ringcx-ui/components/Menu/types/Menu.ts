import type { CSSProperties, ReactElement } from 'react';

export interface IActionMenuItem {
    id: string;
    title: string;
    action?(): void;
    style?: CSSProperties;
    disabled?: boolean;
    toolTip?: string;
}

export interface IMenu {
    toggleComponent: ReactElement;
    options: IActionMenuItem[];
    isOpen?: boolean;
    selectedItemId?: string | null;
    autoFocus?: boolean;
    disableAutoFocusItem?: boolean;
    onClose?(): void;
    disableMenu?: boolean;
}
