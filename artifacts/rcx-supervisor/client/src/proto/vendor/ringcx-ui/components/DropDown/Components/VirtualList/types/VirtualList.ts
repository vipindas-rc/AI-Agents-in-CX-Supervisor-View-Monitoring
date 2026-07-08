import type { IDropdownList, OpenDirection } from '../../../types';

export interface IVirtualList extends IDropdownList {
    width?: number;
    listItemHeight: number;
    visibleItemsCount: number;
    noResultsFoundText: string;
    nothingAvailableText: string;
    openDirection: OpenDirection;
}
