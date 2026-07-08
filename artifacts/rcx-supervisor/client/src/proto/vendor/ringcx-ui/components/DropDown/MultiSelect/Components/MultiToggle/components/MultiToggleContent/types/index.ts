import type { IFlatMenuItem, DropDownSizes } from '../../../../../../types';

export interface IWidthSelectedItems {
    id: string;
    width: number;
}

export interface IToggleContent {
    width: number;
    selectedItemsCount: number;
    selectedItems: IFlatMenuItem[];
    allSelected: boolean;
    allSelectedText?: string;
    disabled: boolean;
    enableClearButton: boolean;
    isOpen: boolean;
    selectedItemId: IFlatMenuItem['id'] | null;
    placeholder: string;
    activePlaceholder?: boolean;
    size: DropDownSizes;
    loading?: boolean;
    handleItemDelete(itemId: IFlatMenuItem['id']): void;
    handleItemSelect(itemId: IFlatMenuItem['id']): void;
}

export interface IVisibleItems {
    visibleCount: number;
    widthAllButton: number;
    hiddenCount: number;
}
