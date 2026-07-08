import type { FC } from 'react';
import { useCallback } from 'react';

import { DropDownFilter } from './DropDownFilter';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import type { Item, SelectedFilters } from '../Filter/types';

export const MultiSelectDropdown: FC<{
    items: Item[];
    selectedIds: string[];
    filterItems: (filterValue: SelectedFilters) => void;
    openLabel: string;
    closeLabel: string;
    ariaLabel?: string;
}> = ({
    items,
    selectedIds,
    filterItems,
    openLabel,
    closeLabel,
    ariaLabel,
}) => {
    const onChangeFeature = useCallback(
        (value: SelectedFilters) => {
            filterItems(value);
        },
        [filterItems]
    );

    return (
        <DropDownFilter
            {...{
                openLabel,
                closeLabel,
                ariaLabel,
                disableFilters: false,
                selectedFilters: selectedIds,
                allItems: items,
                onChangeFeature,
            }}
        />
    );
};

export default CreateAngularModule(
    'multiSelectDropdown',
    MultiSelectDropdown,
    [
        'items',
        'selectedIds',
        'filterItems',
        'openLabel',
        'closeLabel',
        'ariaLabel',
    ],
    []
);
