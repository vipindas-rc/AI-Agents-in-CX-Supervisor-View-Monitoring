import { useRef } from 'react';

import { GrabberMd, TrashMd } from '@ringcentral/spring-icon';
import {
    Badge,
    IconButton,
    Autocomplete,
    SuggestionListItem,
    type SuggestionListItemData,
} from '@ringcentral/spring-ui';
import { TagColor, TagComponent as Tag } from '@ringcx/ui';
import clsx from 'clsx';
import { omit } from 'lodash';
import { useDrag, useDrop } from 'react-dnd';
import { useTranslation } from 'react-i18next';

import type { Category, CategoryPriority } from './types';

type AutocompleteProps = React.ComponentProps<typeof Autocomplete>;

type CategoryPriorityItemProps = {
    category: CategoryPriority;
    options: Category[];
    order: number;
    findItem: (key: string) => {
        item: CategoryPriority | undefined;
        originalIndex: number;
    };
    moveItem: (key: string, atIndex: number) => void;
    updateItem: (key: string, id: string, label: string) => void;
    deleteItem: (key: string) => void;
};

export const CategoryPriorityItem = ({
    category,
    order,
    options,
    moveItem,
    findItem,
    updateItem,
    deleteItem,
}: CategoryPriorityItemProps) => {
    const { t } = useTranslation();
    const ref = useRef<HTMLDivElement>(null);

    const labels = {
        input: t('GENERICS.MODAL.CATEGORY_PRIORITY.CATEGORY_PRIORITY_INDEX', {
            index: order,
        }),
        delete: t('GENERICS.MODAL.CATEGORY_PRIORITY.DELETE_CATEGORY'),
        drag: t('GENERICS.MODAL.CATEGORY_PRIORITY.DRAG_TO_REORDER'),
    };

    const [{ isDragging }, drag] = useDrag({
        type: 'category-priority-item',
        item: category,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    });

    const [, drop] = useDrop<CategoryPriority>(() => ({
        accept: 'category-priority-item',
        hover: ({ key: draggedId }, monitor) => {
            const clientOffset = monitor.getClientOffset();
            if (!ref.current || !clientOffset) {
                return;
            }
            const { key: overItemId } = category;
            const { originalIndex: overIndex } = findItem(overItemId);
            const { originalIndex: dragIndex } = findItem(draggedId);
            // Determine rectangle on screen
            const hoverBoundingRect = ref.current.getBoundingClientRect();
            // Get vertical middle
            const hoverMiddleY =
                (hoverBoundingRect.bottom - hoverBoundingRect.top) * 0.5;
            // Determine mouse position
            // Get pixels to the top
            const hoverClientY = clientOffset.y - hoverBoundingRect.top;
            // Only perform the move when the mouse has crossed half of the items height
            // When dragging downwards, only move when the cursor is below 50%
            // When dragging upwards, only move when the cursor is above 50%
            // Dragging downwards
            if (dragIndex < overIndex && hoverClientY < hoverMiddleY) {
                return;
            }
            // Dragging upwards
            if (dragIndex > overIndex && hoverClientY > hoverMiddleY) {
                return;
            }

            if (draggedId !== overItemId && overIndex !== -1) {
                moveItem(draggedId, overIndex);
            }
        },
    }));

    const value = category.id ? [category] : [];

    const renderTags = (selectedItems: SuggestionListItemData[]) => {
        return selectedItems.map((option) => {
            const optionConfig = options.find(
                (optionConfig) => optionConfig.id === option.id
            );
            if (!optionConfig?.color) {
                return (
                    <span key={option.id} className='text-neutral-b2/70'>
                        {option.label}
                    </span>
                );
            }
            return (
                <Tag
                    stopPropagation={false}
                    key={option.id}
                    text={option.label || ''}
                    color={optionConfig.color}
                />
            );
        });
    };

    const renderOption: AutocompleteProps['renderOption'] = (option, state) => {
        const resultProps = {
            ...omit(option, ['group', 'label']),
            id: String(option.id),
        };
        const isGroupTitle = !('role' in option);
        const isSelected = option.id === category.id;
        return (
            <SuggestionListItem
                {...resultProps}
                isTitleMode={!isGroupTitle}
                isGroupTitle={isGroupTitle}
                disabled={isGroupTitle}
                highlighted={state.highlighted}
                selected={isSelected}
                classes={{ item: 'h-10 py-0 rounded-sm' }}
            >
                <div className='flex min-w-0 items-center'>
                    <div className='flex w-3.5 flex-none items-center'>
                        {isSelected && (
                            <span className='bg-neutral-b0 h-1.5 w-1.5 rounded-full' />
                        )}
                    </div>
                    <div className='flex-1 overflow-hidden'>
                        {renderTags([option])}
                    </div>
                </div>
            </SuggestionListItem>
        );
    };

    const filterOptions: AutocompleteProps['filterOptions'] = (
        options,
        state
    ) => {
        const { inputValue } = state;
        if (!inputValue) {
            return options;
        }
        return options.filter(
            (option) =>
                !!option.label &&
                option.label.toLowerCase().includes(inputValue.toLowerCase())
        );
    };

    const renderNoOptions: AutocompleteProps['renderNoOptions'] = () => (
        <div
            className='typography-mainText text-neutral-b2 flex flex-row items-center justify-center py-4'
            data-aid='no-options'
        >
            {t('DISPOSITIONS.CATEGORIES.NO_RESULT_FOUND')}
        </div>
    );

    const handleChange = (value: SuggestionListItemData[]) => {
        const lastValue = value.at(-1);
        if (!lastValue?.id || !lastValue?.label) {
            return;
        }
        updateItem(category.key, String(lastValue.id), lastValue.label);
    };

    drag(drop(ref));

    return (
        <div className='flex items-center gap-2.5'>
            <Badge
                count={order}
                size='medium'
                color='secondary'
                classes={{ content: 'text-neutral-b0 bg-neutral-b4' }}
            />

            <div
                className={clsx(
                    'flex min-w-0 flex-1 cursor-move items-center gap-2.5 py-1.5',
                    isDragging && 'opacity-0'
                )}
                ref={ref}
                data-aid={`draggable-item-${category.key}`}
            >
                <IconButton
                    classes={{
                        root: 'border-none outline-0 !text-neutral-b3 cursor-move',
                    }}
                    symbol={GrabberMd}
                    size='small'
                    variant='icon'
                    color='neutral'
                    label={labels.drag}
                />

                <Autocomplete
                    multiple
                    toggleButton
                    disableCloseOnSelect={false}
                    autoHighlight={false}
                    clearBtn={false}
                    debug={process.env.NODE_ENV === 'development'}
                    size='medium'
                    inputVariant='outlined'
                    className='min-w-0 flex-1'
                    placeholder={t(
                        'GENERICS.MODAL.CATEGORY_PRIORITY.SELECT_CATEGORY'
                    )}
                    getToggleButtonProps={(isOpen) => ({
                        classes: { root: 'outline-0' },
                        tabIndex: 0,
                        'data-aid': 'toggle-button',
                        'aria-label': isOpen ? 'close' : 'open',
                        'aria-hidden': false,
                    })}
                    PopperProps={{ className: 'z-[9999]' }}
                    inputProps={{ 'aria-label': labels.input }}
                    value={value}
                    options={options}
                    onChange={handleChange}
                    // @ts-expect-error - TODO: fix this
                    groupBy={(option) => option.groupName}
                    filterOptions={filterOptions}
                    renderTags={renderTags}
                    renderOption={renderOption}
                    renderNoOptions={renderNoOptions}
                    SuggestionListProps={{
                        virtualize: false,
                    }}
                />

                <IconButton
                    symbol={TrashMd}
                    variant='icon'
                    size='medium'
                    classes={{ root: '!text-neutral-b0' }}
                    label={labels.delete}
                    onClick={() => deleteItem(category.key)}
                />
            </div>
        </div>
    );
};
