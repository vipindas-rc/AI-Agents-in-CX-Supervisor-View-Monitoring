import { useState, useRef, type KeyboardEvent } from 'react';

import { CaretDownMd } from '@ringcentral/spring-icon';
import {
    Chip,
    Autocomplete,
    type AutocompleteProps,
} from '@ringcentral/spring-ui';
import { isEscapeKey, isVerticalArrowKey, isTabKey } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { HoverableStateContainer } from './HoverableStateContainer';
import { CONTACT_MANAGEMENT_PREFIX } from '../../../../constants/testIds';
import type { TagOption } from '../types';

type AutocompleteWithHoverStateProps = {
    tags: TagOption[];
    label: string;
    value: TagOption[];
    onChange: (tags: TagOption[]) => void;
    onSubmit?: () => void;
};

export const AutocompleteWithHoverState = (
    props: AutocompleteWithHoverStateProps
) => {
    const [editState, setEditState] = useState(false);
    const { value, label, onChange, tags, onSubmit } = props;
    const inputRef = useRef<HTMLInputElement>(null);
    const { t } = useTranslation();
    const [originalValue, setOriginalValue] = useState<TagOption[]>(value);

    const autocompleteFilterOptions: AutocompleteProps['filterOptions'] = (
        options,
        { inputValue, getOptionLabel, selectedItems }
    ) => {
        const selectedItemIds = selectedItems.map(({ id }) => id);
        return options.filter(
            (item) =>
                selectedItemIds.indexOf(item.id) < 0 &&
                getOptionLabel?.(item)
                    .toLowerCase()
                    .includes(inputValue?.toLowerCase() || '')
        );
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (isVerticalArrowKey(e.key)) {
            e.stopPropagation();
        }

        if (isEscapeKey(e.key)) {
            e.preventDefault();
            onChange(originalValue);
            setEditState(false);
        }
    };

    const handleEditClick = () => {
        setOriginalValue(value);
        setEditState(true);
    };

    if (editState) {
        return (
            <Autocomplete
                value={value}
                className='w-9/12'
                options={tags}
                inputVariant='outlined'
                size='large'
                toggleButton
                clearBtn
                onChange={(value) => {
                    onChange(value as TagOption[]);
                }}
                multiple
                SuggestionListProps={{
                    'data-aid': `${CONTACT_MANAGEMENT_PREFIX}suggestion-list`,
                }}
                filterOptions={autocompleteFilterOptions}
                renderTags={(selectedItems, getCustomizedTagProps) => {
                    return selectedItems.map((selectedItem, index) => {
                        const { key, ...itemChipProps } = getCustomizedTagProps(
                            selectedItem,
                            index
                        );

                        return (
                            <Chip
                                {...itemChipProps}
                                key={key}
                                label={selectedItem.label}
                                id='AutocompleteChip'
                                DeleteIconProps={{
                                    id: 'AutocompleteChipDeleteIcon',
                                }}
                            />
                        );
                    });
                }}
                autoFocus
                initialIsOpen
                inputRef={inputRef}
                inputProps={{
                    onBlur: (e: any) => {
                        if (!e.relatedTarget?.id.includes('Autocomplete')) {
                            setEditState(false);
                            onSubmit?.();
                        }
                    },
                    onKeyDown: handleKeyDown,
                    'aria-label': label,
                }}
                ClearButtonProps={{
                    id: 'AutocompleteClearIcon',
                    'data-aid': `${CONTACT_MANAGEMENT_PREFIX}clear-icon`,
                }}
            />
        );
    }

    const renderContent = () => {
        return (
            <div className='flex flex-wrap gap-x-2 gap-y-1 py-1'>
                {value.length !== 0
                    ? value.map(({ id, label }) => {
                          return <Chip key={id} label={label} size='medium' />;
                      })
                    : '-'}
            </div>
        );
    };

    return (
        <HoverableStateContainer
            renderContent={renderContent}
            editIconSymbol={CaretDownMd}
            editIconTitle={t('CONTACT_MANAGEMENT.CONTACT_PROFILE.SELECT')}
            onClickEditButton={handleEditClick}
        />
    );
};
