import type { IFlatMenuItem } from './';

export interface IDropdownList {
    menuItems: IFlatMenuItem[];
    availableMenuItems: IFlatMenuItem[];
    selectedItemId?: IFlatMenuItem['id'] | null;
    keyboardPositionIndex: number | null;
    listScrollPosition: number;
    setListScrollPosition(index: number): void;
    handleMenuItemSelect(item: unknown, index: number): void;
    setHoveredIndex(index: number | null): void;
}
