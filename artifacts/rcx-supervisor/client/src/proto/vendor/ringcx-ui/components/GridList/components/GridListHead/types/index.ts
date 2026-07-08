import type { ReactNode } from 'react';

import type {
    GridListColumn,
    SortState,
    Classes,
    RenderSortIcon,
} from '../../../types';

export type OnChangeSortState = (
    id: string,
    [currentId, currentDirection]: SortState
) => void;

export type GridListHeadType<R, S> = {
    header?: ReactNode;
    isGroupedList: boolean;
    columns: GridListColumn<R, S>[];
    onChangeSortState: OnChangeSortState;
    sortState: SortState;
    isDisableSort: boolean;
    classes?: Classes;
    renderSortIcon?: RenderSortIcon;
};
