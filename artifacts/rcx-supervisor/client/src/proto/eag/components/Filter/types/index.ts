import type { IMenuItem } from '@ringcx/ui';

export type SelectedFilters = IMenuItem['id'][];
export type Item = IMenuItem;

export type FilterType = {
    ariaLabel?: string;
    disabled: boolean;
    openPlaceholder: string;
    closedPlaceholder: string;
    selectedFilters: SelectedFilters;
    allItems?: Item[];
    onChange(value: SelectedFilters): void;
    nothingAvailableText?: string;
    noResultsFoundText?: string;
};
