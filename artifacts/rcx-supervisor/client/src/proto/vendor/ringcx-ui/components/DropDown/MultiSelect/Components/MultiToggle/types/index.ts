import type { SyntheticEvent, RefObject } from 'react';

import type { DropDownSizes, IFlatMenuItem } from '../../../../types';

export interface IMultiToggle {
    isOpen: boolean;
    size: DropDownSizes;
    allSelected: boolean;
    allSelectedText?: string;
    selectedItems: IFlatMenuItem[];
    width: number;
    selectedItemId: IFlatMenuItem['id'] | null;
    filterRef: RefObject<HTMLInputElement>;
    activeItemId?: IFlatMenuItem['id'];
    disabled?: boolean;
    loading?: boolean;
    enableClearButton: boolean;
    filterValue?: string | null;
    placeholder: string;
    expandedPlaceholder?: string;
    activePlaceholder?: boolean;
    ariaLabel?: string;
    handleFilterChange(value: string): void;
    handleFilterFocus(e: SyntheticEvent): void;
    handleItemDelete(itemId: IFlatMenuItem['id']): void;
    handleItemSelect(itemId: IFlatMenuItem['id']): void;
    handleToggleClick(isOpen: boolean): void;
    handleDeselectAll: (e: SyntheticEvent) => void;
}
