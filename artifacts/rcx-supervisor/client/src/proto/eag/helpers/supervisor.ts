import type { SortType } from '@ringcx/ui';
import { SortDirection } from '@ringcx/ui';

import injector from './injector';

const parseCategoryIds = (
    categoryString: string,
    categoryOrderMap: Record<string, number>
): string[] => {
    const ids = (categoryString || '')
        .split(',')
        .map((id: string) => id.trim())
        .filter(Boolean)
        .filter((id) => categoryOrderMap[id] !== undefined);

    return ids.sort((idA, idB) => {
        const orderA = categoryOrderMap[idA];
        const orderB = categoryOrderMap[idB];
        return orderA - orderB;
    });
};

const applySortDirection = (
    result: number,
    direction: SortDirection
): number => (direction === SortDirection.ASC ? result : -result);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function categoriesSortingHelper<T extends Record<string, any> = any>(
    data: T[],
    direction: SortDirection,
    sortType: SortType,
    compareKeys: string[]
): T[] {
    if (direction === SortDirection.NONE) return data;

    const PriorityCategoriesNotificationSvc = injector(
        'PriorityCategoriesNotificationSvc'
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;

    // Get sorted category IDs list (priority first by order, then non-priority by name)
    const sortedCategoryIds =
        PriorityCategoriesNotificationSvc.getSortedCategoryIds();

    // Create a map of category ID to its sort order position
    const categoryOrderMap: Record<string, number> = {};
    sortedCategoryIds.forEach((id: string, index: number) => {
        categoryOrderMap[id] = index;
    });

    return [...data].sort((a, b) => {
        const categoryIdsA = parseCategoryIds(
            (a[compareKeys[0]] as string) || '',
            categoryOrderMap
        );
        const categoryIdsB = parseCategoryIds(
            (b[compareKeys[0]] as string) || '',
            categoryOrderMap
        );

        // 0. Put empty category IDs at the end regardless of sort direction
        const isEmptyA = categoryIdsA.length === 0;
        const isEmptyB = categoryIdsB.length === 0;

        if (isEmptyA && !isEmptyB) return 1;
        if (!isEmptyA && isEmptyB) return -1;
        if (isEmptyA && isEmptyB) return 0;

        // 1. Compare categories by their position in the sorted list
        const maxLength = Math.max(categoryIdsA.length, categoryIdsB.length);

        for (let i = 0; i < maxLength; i++) {
            const categoryIdA = categoryIdsA[i];
            const categoryIdB = categoryIdsB[i];

            if (!categoryIdA && categoryIdB) {
                return direction === SortDirection.ASC ? 1 : -1;
            }
            if (categoryIdA && !categoryIdB) {
                return direction === SortDirection.ASC ? -1 : 1;
            }

            const orderA = categoryOrderMap[categoryIdA];
            const orderB = categoryOrderMap[categoryIdB];

            // Compare by position in sorted list
            const orderDiff = orderA - orderB;
            if (orderDiff !== 0) {
                return applySortDirection(orderDiff, direction);
            }
        }

        // 2. If all categories are equal, maintain original order
        return 0;
    });
}
