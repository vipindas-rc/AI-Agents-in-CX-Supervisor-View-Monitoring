import type { ReactNode } from 'react';

import type { SortDirection, SortType } from '../../../helpers';

export type OpenState = Record<string, boolean>;

export type SortState = [string, SortDirection];

export type Classes = Partial<
    Record<
        | 'head'
        | 'head-row'
        | 'row'
        | 'sub-row'
        | 'head-item-container'
        | 'head-item',
        string
    >
>;

export type SortAliasOneRow<R> = [keyof R | undefined];
export type SortAliasGroup<R, S> = [keyof R | undefined, keyof S | undefined];
export type SortAlias<R, S = undefined> = S extends undefined
    ? SortAliasOneRow<R>
    : SortAliasGroup<R, S>;

export type SortingHelper<R, S = undefined> = (
    data: RenderRowsData<R, S>,
    direction: SortDirection,
    sortType: SortType,
    compareKeys: CompareKeys<R, S>
) => RenderRowsData<R, S>;

export type CompareKeys<R, S> = [keyof R, keyof S];

export type GridListColumn<R, S = undefined> = {
    id: string;
    content: ReactNode;
    sortAs?: SortType;
    sortAlias?: S extends undefined ? SortAlias<R> : SortAliasGroup<R, S>;
    sortingHelper?: SortingHelper<R, S>;
    columnAriaLabel?: string;
};

export type RenderSubRowData<S> = {
    glId: string;
    readonly parentGlId?: string;
} & S;

export type RenderRowOneRowData<R> = {
    glId: string;
    isHidden?: boolean;
} & R;
export type RenderRowGroupData<R, S> = {
    glId: string;
    subRows: RenderSubRowData<S>[];
    isHidden?: boolean;
} & R;
export type RenderRowData<R, S = undefined> = S extends undefined
    ? RenderRowOneRowData<R>
    : RenderRowGroupData<R, S>;

export type RenderRowsOneRowData<R> = RenderRowOneRowData<R>[];
export type RenderRowsGroupData<R, S> = RenderRowGroupData<R, S>[];
export type RenderRowsData<R, S = undefined> = RenderRowData<R, S>[];

export type FiltrationCallback<R, S = undefined> = (
    data: RenderRowsData<R, S>
) => [data: RenderRowsData<R, S>, forceOpen?: boolean];

export type OnChangeOpen = (openState: OpenState) => void;

export type OnChangeSort = (sortState: SortState) => void;

export type OnChangeOpenState = (rowId: string) => void;

export type RenderRow<R> = (data: R) => ReactNode;

export type RenderSubRow<S> = (data: S) => ReactNode;

export type RenderEmptyRow<R> = (groupRowData: R) => ReactNode;

export type GridListBaseProps = {
    disableRowOpenStyles?: boolean;
    disableHoverStyles?: boolean;
    disableCheckedStyles?: boolean;
    isCheckboxesOutside?: boolean;
    isAnyCheckboxSelected?: boolean;
    disableDefaultCheckboxVisibleStyle?: boolean;
};

export type RenderSortIconProps = {
    direction: SortDirection;
    isSortable: boolean;
};

export type RenderSortIcon = (props: RenderSortIconProps) => ReactNode;

export type GetRowHeight<R> = (data: R, isExpanded: boolean) => number;

export type OnFilteredDataChange<R, S = undefined> = (
    filteredData: RenderRowsData<R, S>
) => void;

export type GridListType<R, S = undefined> = {
    listAriaLabel?: string;
    header?: ReactNode;
    columns: GridListColumn<R, S>[];
    data: RenderRowsData<R, S>;
    loading?: boolean;
    renderEmptyFilterResult?: () => ReactNode;
    renderEmptyDataResult?: () => ReactNode;
    filtrationCallback?: FiltrationCallback<R, S>;
    className?: string;
    initialOpenState?: OpenState;
    initialSortState?: SortState;
    virtualListBorder?: number;
    useDynamicHeight?: boolean;
    rowHeight?: number;
    // Optional, applicable for dynamic height calculation in virtual list
    getRowHeight?: GetRowHeight<R>;
    rowBuffer?: number;
    onChangeOpen?: OnChangeOpen;
    onChangeSort?: OnChangeSort;
    onFilteredDataChange?: OnFilteredDataChange<R, S>;
    isDisableSort?: boolean;
    isScrollDisabled?: boolean;
    hideNoneSortDirection?: boolean;
    classes?: Classes;
    renderSortIcon?: RenderSortIcon;
    ariaRoleForRows?: string;
    // Optional, for virtualization with custom scroll container
    // Use with caution, might not yet be supported for all use cases
    scrollContainerElement?: HTMLElement | null;
    // Optional, allows to auto-scroll table to row with provided glId on mount or change
    // if undefined passed: won't scroll
    // if empty string passed: will scroll to top and reset virtual scroll state
    scrollToRowId?: string;
    screenReaderHelper?: (text: string, shouldFocus?: boolean) => void;
} & (S extends undefined
    ? {
          renderRow: RenderRow<R>;
      }
    : {
          renderRow: RenderRow<R>;
          renderSubRow: RenderSubRow<S>;
          renderEmptyRow: RenderEmptyRow<R>;
      }) &
    GridListBaseProps;
