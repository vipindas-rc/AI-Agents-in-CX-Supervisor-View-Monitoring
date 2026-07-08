import type { IFlatMenuItem } from '../../../types';

export interface IListItem {
    item: IFlatMenuItem;
    index: number;
    keyboardPositionIndex: number | null;
    isSelected: boolean;
    handleMenuItemSelect(item: IFlatMenuItem, index: number): void;
    listItemHeight: number;
}
