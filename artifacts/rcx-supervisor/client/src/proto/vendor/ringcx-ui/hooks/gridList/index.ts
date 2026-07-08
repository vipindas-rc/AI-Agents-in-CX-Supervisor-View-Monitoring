import { useCallback, useEffect, useMemo, useState } from 'react';

import type {
    CompareKeys,
    FiltrationCallback,
    GridListColumn,
    OnChangeOpen,
    OnChangeOpenState,
    OnChangeSort,
    OpenState,
    RenderRowsData,
    SortState,
} from '../../components';
import type { OnChangeSortState } from '../../components/GridList/components/GridListHead/types';
import { defaultSortingHelper, getIsGroupedList } from '../../helpers/gridList';
import { findNextDirection, SortDirection } from '../../helpers/sorting';

export const useIsGroupedList = <R, S = undefined>(
    data: RenderRowsData<R, S>
): boolean => useMemo(() => getIsGroupedList(data), [data]);

/* SORTING */
export const useSortState = (
    initialSortState?: SortState,
    onChangeSort?: OnChangeSort,
    hideNoneSortDirection?: boolean
): [SortState, OnChangeSortState] => {
    const defaultSortDirection = hideNoneSortDirection
        ? SortDirection.DESC
        : SortDirection.NONE;
    const [sortState, setSortState] = useState<SortState>(
        initialSortState || ['', defaultSortDirection]
    );

    const onChangeSortState = useCallback(
        (id: string, [currentId, currentDirection]: SortState) => {
            const newDirection = findNextDirection(
                currentId === id ? currentDirection : defaultSortDirection,
                hideNoneSortDirection
            );

            setSortState([id, newDirection]);
            onChangeSort && onChangeSort([id, newDirection]);
        },
        [defaultSortDirection, hideNoneSortDirection, onChangeSort]
    );
    return [sortState, onChangeSortState];
};
export const useSorting = <R, S = undefined>(
    data: RenderRowsData<R, S>,
    columns: GridListColumn<R, S>[],
    setReady: (state: boolean) => void,
    initialSortState?: SortState,
    onChangeSort?: OnChangeSort,
    hideNoneSortDirection?: boolean
): [RenderRowsData<R, S>, SortState, OnChangeSortState] => {
    const [sortState, onChangeSortState] = useSortState(
        initialSortState,
        onChangeSort,
        hideNoneSortDirection
    );
    const [sortedData, setSortedData] = useState<RenderRowsData<R, S>>(data);

    useEffect(() => {
        const [id, direction] = sortState;
        const compareColumn = columns.find((column) => column.id === id);
        const sortingHelper =
            compareColumn?.sortingHelper || defaultSortingHelper;

        if (compareColumn?.sortAs) {
            const compareKeys: CompareKeys<R, S> = [
                compareColumn.sortAlias?.[0] || (id as keyof R),
                compareColumn.sortAlias?.[1] || (id as keyof S),
            ];

            const sortedData = sortingHelper(
                data,
                direction,
                compareColumn.sortAs!,
                compareKeys
            );

            setSortedData(sortedData);
            setReady(true);
        } else {
            setSortedData(data);
            setReady(true);
        }
    }, [data, sortState, columns, setReady]);

    return [sortedData, sortState, onChangeSortState];
};
/* END SORTING */

/* OPEN STATE */
export const useOpenState = (
    initialOpenState: OpenState = {},
    onChangeOpen?: OnChangeOpen
): [
    OpenState,
    (overrideOpenState: OpenState | null) => void,
    OnChangeOpenState,
] => {
    // TODO: think about to use only one useState after migration to new react architecture
    const [openState, setOpenState] = useState<OpenState>(initialOpenState);

    const [overrideOpenState, setOverrideOpenState] =
        useState<OpenState | null>(null);

    useEffect(() => {
        if (Object.keys(initialOpenState).length) {
            setOverrideOpenState(initialOpenState);
        }
    }, [initialOpenState, setOverrideOpenState]);

    const onChangeOpenState = useCallback(
        (id: string) => {
            let syncWithOverrideState: boolean | undefined = undefined;
            let overrideState: OpenState | null = null;

            setOverrideOpenState((oldState) => {
                if (oldState) {
                    syncWithOverrideState = !oldState[id];

                    overrideState = {
                        ...oldState,
                        [id]: syncWithOverrideState,
                    };
                    return overrideState;
                }

                return null;
            });

            setOpenState((oldState) => {
                const newState =
                    typeof syncWithOverrideState === 'boolean'
                        ? { ...overrideState }
                        : {
                              ...oldState,
                              [id]: !oldState[id],
                          };
                onChangeOpen && onChangeOpen(newState);

                return newState;
            });
        },
        [onChangeOpen]
    );

    return [
        overrideOpenState || openState,
        setOverrideOpenState,
        onChangeOpenState,
    ];
};
/* END OPEN STATE */

/* FILTRATION */
export const useFiltration = <R, S = undefined>(
    data: RenderRowsData<R, S>,
    setOverrideOpenState: (state: OpenState | null) => void,
    setReady: (state: boolean) => void,
    filtrationCallback?: FiltrationCallback<R, S>
): RenderRowsData<R, S> => {
    const [filteredData, setFilteredData] =
        useState<RenderRowsData<R, S>>(data);

    useEffect(() => {
        if (filtrationCallback) {
            const [callbackData, forceOpen] = filtrationCallback(data);

            if (typeof forceOpen !== 'undefined') {
                const overrideOpenState = forceOpen
                    ? // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                      // @ts-ignore
                      callbackData.reduce<OpenState>((accum, item) => {
                          accum[item.glId] = true;

                          return accum;
                      }, {})
                    : null;

                setOverrideOpenState(overrideOpenState);
            }
            setFilteredData(callbackData);
            setReady(true);
        } else {
            setFilteredData(data);
            setReady(true);
        }
    }, [data, filtrationCallback, setOverrideOpenState, setReady]);

    return filteredData;
};
/* END FILTRATION */
