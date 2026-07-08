import type {
    CompareKeys,
    RenderRowData,
    RenderRowsData,
    RenderSubRowData,
} from '../../components';
import type { SortDirection, SortType } from '../sorting';
import { sortingHelper } from '../sorting';

export const defaultSortingHelper = <R, S = undefined>(
    data: RenderRowsData<R, S>,
    direction: SortDirection,
    sortType: SortType,
    compareKeys: CompareKeys<R, S>
): RenderRowsData<R, S> => {
    const sortedRows = sortingHelper<RenderRowData<R, S>>(
        data,
        direction,
        sortType,
        compareKeys[0]
    );

    for (let i = 0; i < sortedRows.length; i++) {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (sortedRows[i].subRows?.length) {
            sortedRows[i] = {
                ...sortedRows[i],
                subRows: sortingHelper<RenderSubRowData<S>>(
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    sortedRows[i].subRows!,
                    direction,
                    sortType,
                    compareKeys[1]
                ),
            };
        }
    }

    return sortedRows;
};

export const getRowsCount = <R, S = undefined>(
    data: RenderRowsData<R, S>
): number =>
    data.reduce<number>((accum, row) => {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        if (row.subRows?.length) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            return accum + row.subRows.length;
        }

        return accum;
    }, data.length);

export const checkDisableSort = <R, S = undefined>(
    data: RenderRowsData<R, S>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
): boolean => data.length <= 1 && (data?.[0]?.subRows?.length || 0) <= 1;

export const getIsGroupedList = <R, S = undefined>(
    data: RenderRowsData<R, S>
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
): boolean => data.some((row) => Array.isArray(row.subRows));

export * from './scrollHelpers';
