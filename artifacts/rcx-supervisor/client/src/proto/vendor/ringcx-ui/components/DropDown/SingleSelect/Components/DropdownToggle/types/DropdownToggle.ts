import type { SyntheticEvent } from 'react';

import type { IToolTipProps } from '../../../../../Tooltip/types/Tooltip';
import type { DropDownSizes, IMenuItem } from '../../../../types';

export interface IDropdownToggle {
    size: DropDownSizes;
    isOpen: boolean;
    disabled: boolean;
    isSearchable: boolean;
    showExistItem: boolean;
    filterValue?: string;
    placeholder?: string;
    placeholderVariant?: IMenuItem['variant'];
    activePlaceholder?: boolean;
    loadingPlaceholder?: string;
    handleFilterChange(value: string): void;
    onChange(id: string): void;
    handleToggleClick?(e: SyntheticEvent): void;
    loading?: boolean;
    enableClearButton?: boolean;
    toggleIcon?: string;
    tooltipPlacement?: IToolTipProps['placement'];
    ariaLabel?: string;
    ariaLabelledBy?: string;
}
