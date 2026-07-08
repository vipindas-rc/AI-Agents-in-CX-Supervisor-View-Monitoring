import { sum } from 'lodash';

import {
    CATEGORIES_GAP,
    COUNTER_WIDTH,
} from '../components/CategoriesCell.style';
import type { Categories } from '../types/CategoriesCell';

export const checkVisibleTags = (
    tagsWidths: number[],
    containerWidth: number
) => {
    const tagElementsVisibility = {
        visibleCount: 0,
        hiddenCount: 0,
        width: 0,
    };

    if (!tagsWidths.length) {
        return tagElementsVisibility;
    }

    const allTagsWidth = sum(tagsWidths) + tagsWidths.length * CATEGORIES_GAP;
    if (allTagsWidth > containerWidth) {
        tagElementsVisibility.width = COUNTER_WIDTH;
    }

    return tagsWidths.reduce((result, tagWidth) => {
        const width = result.width + tagWidth + CATEGORIES_GAP;
        const visibleCount = result.visibleCount + 1;

        return width < containerWidth
            ? {
                  visibleCount,
                  width,
                  hiddenCount: Math.abs(tagsWidths.length - visibleCount),
              }
            : {
                  ...result,
                  width,
                  hiddenCount: Math.abs(
                      tagsWidths.length - result.visibleCount
                  ),
              };
    }, tagElementsVisibility);
};

export const getVisibleCategories = (
    categories: Categories,
    visibleCount: number
) => {
    return categories.length !== visibleCount
        ? categories.slice(0, visibleCount)
        : categories;
};

export const getHiddenCategories = (
    categories: Categories,
    hiddenCount: number
) => {
    return hiddenCount !== 0 ? categories.slice(hiddenCount * -1) : [];
};
