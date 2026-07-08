import { useState, useRef, useLayoutEffect, useMemo } from 'react';

import { TagComponent as Tag } from '@ringcx/ui';

import {
    CategoriesListColumn,
    HiddenCategories,
    HiddenCategoriesCounter,
    StyledPopper,
    CategoriesListHiddenItems,
} from './CategoriesCell.style';
import {
    CATEGORIES_CELL,
    CATEGORY_TAG,
    EMPTY_CATEGORIES_CELL,
    HIDDEN_CATEGORIES_COUNTER,
} from '../../../constants/testIds';
import injector from '../../../helpers/injector';
import type { Categories } from '../types/CategoriesCell';
import {
    checkVisibleTags,
    getHiddenCategories,
    getVisibleCategories,
} from '../utils/CategoriesCellUtil';

export const CategoriesCell = ({ categoryIds }: { categoryIds: string }) => {
    const CategoriesService = injector('CategoriesSvc');
    const DashboardService = injector('DashboardSvc');
    const PriorityCategoriesNotificationService = injector(
        'PriorityCategoriesNotificationSvc'
    );
    const priorityCategoriesSettings =
        DashboardService.getPriorityCategoriesSettings();
    const categoriesMap = CategoriesService.getCategoriesMap();
    const { priorityCategories } = priorityCategoriesSettings;
    const sortedCategoryIds =
        PriorityCategoriesNotificationService.getSortedCategoryIds();

    const categories: Categories = useMemo(() => {
        const categoryIdsArray = categoryIds
            ? categoryIds
                  .split(',')
                  .filter((item) => item.trim())
                  .map((id) => id.trim())
            : [];

        const categoriesArray = categoryIdsArray
            .filter((categoryId) => Boolean(categoriesMap[categoryId]))
            .map((categoryId) => ({
                ...categoriesMap[categoryId],
                isPriority: !!priorityCategories?.[categoryId],
            }));

        return categoriesArray.sort((a, b) => {
            const indexA = sortedCategoryIds.indexOf(a.id);
            const indexB = sortedCategoryIds.indexOf(b.id);

            if (indexA !== -1 && indexB !== -1) {
                return indexA - indexB;
            }

            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;

            return 0;
        });
    }, [categoryIds, categoriesMap, priorityCategories, sortedCategoryIds]);
    const [visibleCategories, setVisibleCategories] =
        useState<Categories>(categories);
    const [hiddenCategories, setHiddenCategories] = useState<Categories>([]);
    const categoriesListRef = useRef<HTMLDivElement>(null);
    const tagsWidthsRef = useRef<number[]>([]);

    useLayoutEffect(() => {
        if (categories.length === 0) {
            setVisibleCategories([]);
            setHiddenCategories([]);
            tagsWidthsRef.current = [];
            return;
        }

        setVisibleCategories(categories);
        setHiddenCategories([]);

        const animationId = requestAnimationFrame(() => {
            if (!categoriesListRef.current) return;

            const categoriesListElement: HTMLDivElement =
                categoriesListRef.current;
            const widthDiv = categoriesListElement.offsetWidth;

            tagsWidthsRef.current = Array.from(
                categoriesListElement.children as HTMLCollectionOf<HTMLDivElement>
            ).map((tag: HTMLDivElement) => tag.offsetWidth);

            const { visibleCount, hiddenCount } = checkVisibleTags(
                tagsWidthsRef.current,
                widthDiv
            );
            const visibleItems = getVisibleCategories(categories, visibleCount);
            const hiddenItems = getHiddenCategories(categories, hiddenCount);

            setVisibleCategories(visibleItems);
            setHiddenCategories(hiddenItems);
        });

        return () => cancelAnimationFrame(animationId);
    }, [categories]);

    if (categories.length === 0) {
        return (
            <CategoriesListColumn
                data-aid={EMPTY_CATEGORIES_CELL}
                role='gridcell'
            >
                —
            </CategoriesListColumn>
        );
    }

    return (
        <CategoriesListColumn
            data-aid={CATEGORIES_CELL}
            ref={categoriesListRef}
            role='gridcell'
        >
            {visibleCategories.map((category) => (
                <Tag
                    data-aid={CATEGORY_TAG}
                    key={category.id}
                    text={category.name}
                    color={category.color}
                    shouldShowAlertIcon={category.isPriority}
                />
            ))}
            {hiddenCategories.length > 0 && (
                <HiddenCategories>
                    <span>...</span>
                    <HiddenCategoriesCounter
                        data-aid={HIDDEN_CATEGORIES_COUNTER}
                    >
                        <StyledPopper
                            toggleComponent={`+${hiddenCategories.length}`}
                            showOnHover={true}
                            hideOnBlur={true}
                            placement='bottom'
                        >
                            <CategoriesListHiddenItems>
                                {hiddenCategories.map((category) => (
                                    <Tag
                                        key={category.id}
                                        text={category.name}
                                        color={category.color}
                                        shouldShowAlertIcon={
                                            category.isPriority
                                        }
                                    />
                                ))}
                            </CategoriesListHiddenItems>
                        </StyledPopper>
                    </HiddenCategoriesCounter>
                </HiddenCategories>
            )}
        </CategoriesListColumn>
    );
};
