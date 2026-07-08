import type { FC } from 'react';
import { useMemo, useState } from 'react';

import { StyledMultiSelect } from './Filter.styled';
import type { FilterType } from './types';

export const Filter: FC<FilterType> = ({
    ariaLabel,
    closedPlaceholder,
    openPlaceholder,
    selectedFilters,
    allItems = [],
    onChange,
    disabled,
    nothingAvailableText,
    noResultsFoundText,
}) => {
    const [isOpen, setOpen] = useState(false);
    const dropdownMenuItems = useMemo(
        () => ({
            items: allItems,
        }),
        [allItems]
    );
    // TODO think about this options in engage-ui -__-
    const placeholder = isOpen ? openPlaceholder : closedPlaceholder;
    const onOpen = () => setOpen(true);
    const onClose = () => setOpen(false);

    return (
        <StyledMultiSelect
            {...{
                title: '',
                error: false,
                message: '',
                data: dropdownMenuItems,
                selectedItemsIds: selectedFilters,
                onChange,
                onOpen,
                onClose,
                useDefaultSort: false,
                placeholder,
                activePlaceholder: true,
                enableActions: false,
                disabled,
                enableClearButton: true,
                nothingAvailableText,
                noResultsFoundText,
                ariaLabel,
            }}
        />
    );
};
