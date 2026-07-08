import type { FC } from 'react';
import { useCallback, useMemo, useState } from 'react';

import type { IMenuItem, IMenuGroup } from '@ringcx/ui';
import { TagColor, DisplayVariantType } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { StyledGroupedCategoriesMultiSelect } from './GroupedCategoriesMultiSelect.styled';
import type {
    CategoryList,
    Categories,
    GroupedCategoriesMultiSelectProps,
} from './types';
import { PRIORITY_CATEGORIES_ID } from '../../containers/SupervisorAgentList/constants';

export const GroupedCategoriesMultiSelect: FC<
    GroupedCategoriesMultiSelectProps
> = ({
    categoryList = [],
    selectedCategories = [],
    onCategoriesChange,
    openLabel,
    closeLabel,
    ariaLabel,
}) => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);

    const selectedItemsIds = useMemo(() => {
        if (!selectedCategories || !Array.isArray(selectedCategories)) {
            return [];
        }
        return selectedCategories;
    }, [selectedCategories]);

    const multiSelectData = useMemo(() => {
        const groups: IMenuGroup[] = [];
        const items: IMenuItem[] = [];

        const isPriorityCategoriesSelected = selectedItemsIds.includes(
            PRIORITY_CATEGORIES_ID
        );

        // Separate priority group and other groups in a single pass
        const otherGroups: CategoryList[number][] = [];
        let priorityGroup: CategoryList[number] | undefined;

        (categoryList || []).forEach((group: CategoryList[number]) => {
            if (group.id === PRIORITY_CATEGORIES_ID) {
                priorityGroup = group;
            } else {
                otherGroups.push(group);
            }
        });

        const priorityCategoryIds =
            priorityGroup?.categories.map((cat: Categories) => cat.id) || [];

        // Process priority group first (if exists)
        if (priorityGroup) {
            groups.push({
                id: PRIORITY_CATEGORIES_ID,
                displayName: priorityGroup.name,
                hidden: true,
            });

            if (priorityGroup.categories.length > 0) {
                items.push({
                    id: PRIORITY_CATEGORIES_ID,
                    displayName: priorityGroup.name,
                    groupId: PRIORITY_CATEGORIES_ID,
                });
            }
        }

        // Process other groups
        otherGroups.forEach((group: CategoryList[number]) => {
            if (group.categories.length === 0) {
                groups.push({
                    id: group.id,
                    displayName: group.name,
                    hidden: false,
                });
                return;
            }

            groups.push({
                id: group.id,
                displayName: group.name,
                hidden: false,
            });

            group.categories.forEach((category: Categories) => {
                if (
                    isPriorityCategoriesSelected &&
                    priorityCategoryIds.includes(category.id)
                ) {
                    if (!selectedItemsIds.includes(category.id)) {
                        return;
                    }
                }

                items.push({
                    id: category.id,
                    displayName: category.name,
                    groupId: group.id,
                    variant: {
                        type: DisplayVariantType.Tag,
                        color: category.color || group.color || TagColor.Grey,
                    },
                });
            });
        });

        return { groups, items };
    }, [categoryList, selectedItemsIds]);

    const handleChange = useCallback(
        (ids: string[]) => {
            const validIds = ids.filter((id) => {
                const isItem = multiSelectData.items.some(
                    (item) => item.id === id
                );
                if (isItem) {
                    return true;
                }
                const isGroupId = multiSelectData.groups.some(
                    (g) => g.id === id
                );
                return !isGroupId;
            });

            onCategoriesChange(validIds);
        },
        [onCategoriesChange, multiSelectData.groups, multiSelectData.items]
    );

    const placeholder = useMemo(() => {
        return isOpen ? t(openLabel) : t(closeLabel);
    }, [isOpen, openLabel, closeLabel, t]);

    return (
        <StyledGroupedCategoriesMultiSelect
            data={multiSelectData}
            selectedItemsIds={selectedItemsIds}
            onChange={handleChange}
            placeholder={placeholder}
            activePlaceholder={true}
            title=''
            error={false}
            message=''
            required={false}
            enableActions={false}
            enableClearButton={true}
            useDefaultSort={false}
            onOpen={() => setIsOpen(true)}
            onClose={() => setIsOpen(false)}
            ariaLabel={ariaLabel || t(closeLabel)}
            noResultsFoundText={t('MONITORING.SEARCH_BAR.NO_RESULT_FOUND')}
            nothingAvailableText={t('MONITORING.SEARCH_BAR.NOTHING_AVAILABLE')}
        />
    );
};
