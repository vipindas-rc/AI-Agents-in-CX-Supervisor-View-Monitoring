import type { CategoryPriority, PriorityCategoriesSettings } from './types';
import type { CategoryGroup } from '../CategoriesAutoComplete/types';

export const formatCategoriesToOptions = (categories: CategoryGroup[]) => {
    const options = categories
        .map((categoryGroup) => {
            return categoryGroup.categories.map((category) => ({
                id: category.id,
                groupName: categoryGroup.name,
                label: category.name,
                color: categoryGroup.color,
            }));
        })
        .flat();

    const categoryIdToOptionMap = new Map(
        options.map((option) => [option.id, option])
    );

    return { options, categoryIdToOptionMap };
};

export const getInitialCategoriesPrioritySettings = (
    priorityCategoriesSettings: PriorityCategoriesSettings,
    categoryIdToOptionMap: ReturnType<
        typeof formatCategoriesToOptions
    >['categoryIdToOptionMap']
) => {
    const { priorityCategories, isNotificationEnabled } =
        priorityCategoriesSettings;

    let categoryPriorities = Object.keys(priorityCategories)
        .filter((categoryId) => categoryIdToOptionMap.has(categoryId))
        .sort((a, b) => priorityCategories[a] - priorityCategories[b])
        .map((categoryId) => ({
            key: crypto.randomUUID(),
            id: categoryId,
            label: categoryIdToOptionMap.get(categoryId)?.label ?? '',
        })) as CategoryPriority[];

    if (!categoryPriorities.length) {
        categoryPriorities = [{ key: crypto.randomUUID(), id: '', label: '' }];
    }

    return {
        isNotificationEnabled: !!isNotificationEnabled,
        categoryPriorities,
    };
};
