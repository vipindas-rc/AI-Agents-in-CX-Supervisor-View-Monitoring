import type { Item, SelectedFilters } from '../../Filter/types';
export type DropDownFilterType = {
    disableFilters: boolean;
    selectedFilters: SelectedFilters;
    allItems: Item[];
    onChangeFeature(value: SelectedFilters): void;
    openLabel: string;
    closeLabel: string;
    ariaLabel?: string;
};
export type IDInteractiontableColumns = {
    initialEngagementSourceName: string;
    productName: string;
    agentDurationMs: number;
};
