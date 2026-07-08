import { SORT_DIRECTION_ORDER } from './constants';
import type { ValueNormalizer } from './types';
import { SortDirection, SortType } from './types';

export const NORMALIZERS_MAP = {
    number: (value: unknown): number => {
        const convertedValue = Number(value);

        if (value === null || isNaN(convertedValue)) {
            return Infinity;
        }

        return convertedValue;
    },
    string: (value: unknown): string => String(value).toUpperCase(),
};

export const findNextDirection = (
    sortDirection: SortDirection,
    hideNoneSortDirection?: boolean
): SortDirection => {
    const sortDirectionOrder = hideNoneSortDirection
        ? SORT_DIRECTION_ORDER.filter((d) => d !== SortDirection.NONE)
        : SORT_DIRECTION_ORDER;

    const currentIndex = sortDirectionOrder.findIndex(
        (item) => item === sortDirection
    );

    if (currentIndex === -1 || currentIndex === sortDirectionOrder.length - 1) {
        return hideNoneSortDirection ? SortDirection.ASC : SortDirection.NONE;
    }

    return sortDirectionOrder[currentIndex + 1];
};

export const desc = <T>(
    a: T,
    b: T,
    orderBy: keyof T,
    valueNormalizer: ValueNormalizer
): number => {
    const valueA = valueNormalizer(a[orderBy]);
    const valueB = valueNormalizer(b[orderBy]);

    if (valueB < valueA) {
        return -1;
    }

    if (valueB > valueA) {
        return 1;
    }

    return 0;
};

export const getSorter = <T>(
    direction: SortDirection,
    orderBy: keyof T,
    valueNormalizer: ValueNormalizer
): ((a: T, b: T) => number) => {
    if (direction === SortDirection.DESC) {
        return (a, b) => desc<T>(a, b, orderBy, valueNormalizer);
    }

    if (direction === SortDirection.ASC) {
        return (a, b) => -desc<T>(a, b, orderBy, valueNormalizer);
    }

    throw new Error('Unsupported sort direction');
};

export const sortingHelper = <A extends Record<never, never>>(
    data: A[],
    direction: SortDirection,
    sortType: SortType,
    orderBy: keyof A
): A[] => {
    switch (direction) {
        case SortDirection.ASC:
        case SortDirection.DESC: {
            let valueNormalizer: ValueNormalizer;

            switch (sortType) {
                case SortType.STRING:
                    valueNormalizer = NORMALIZERS_MAP.string;
                    break;
                case SortType.NUMBER:
                    valueNormalizer = NORMALIZERS_MAP.number;
                    break;
            }

            return [...data].sort(
                getSorter(direction, orderBy, valueNormalizer)
            );
        }
        default:
            return data;
    }
};
