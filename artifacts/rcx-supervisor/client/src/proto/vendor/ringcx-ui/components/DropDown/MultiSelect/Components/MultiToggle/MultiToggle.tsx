import type { ChangeEvent, FC, KeyboardEvent, SyntheticEvent } from 'react';
import { memo, useCallback, useEffect, useMemo } from 'react';

import { MultiToggleContent } from './components/MultiToggleContent';
import { MultiToggleItem } from './components/MultiToggleItem';
import {
    StyledArrowIcon,
    StyledCloseIcon,
    StyledItemsWrapper,
    StyledMultiToggle,
    StyledSpinner,
    StyledToggleContent,
    StyledToggleFilter,
} from './MultiToggle.styled';
import type { IMultiToggle } from './types';
import { TEST_AID } from '../../../../../constants/index';
import { CloseSvg } from '../../../../../icons';
import { ArrowDirection } from '../../../../../icons/types/Arrow';
import type { IFlatMenuItem } from '../../../types';

const MultiToggle: FC<IMultiToggle> = ({
    isOpen,
    size,
    allSelected,
    allSelectedText,
    selectedItems,
    width,
    selectedItemId,
    disabled = false,
    enableClearButton,
    filterRef,
    filterValue = '',
    placeholder,
    expandedPlaceholder,
    activePlaceholder,
    ariaLabel,
    loading = false,
    handleFilterChange,
    handleToggleClick,
    handleFilterFocus,
    handleItemDelete,
    handleItemSelect,
    handleDeselectAll,
}) => {
    const onToggleClick = useCallback(() => {
        if (!disabled) {
            handleToggleClick(!isOpen);
        }
    }, [disabled, handleToggleClick, isOpen]);

    useEffect(() => {
        if (isOpen && filterRef.current) {
            filterRef.current.focus();
        }
    }, [filterRef, isOpen]);

    const handleChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => {
            e.stopPropagation();
            const { value } = e.target;
            handleFilterChange(value);
        },
        [handleFilterChange]
    );

    const handleFilterClick = useCallback(
        (e: SyntheticEvent) => {
            e.stopPropagation();
            if (!isOpen) {
                handleToggleClick(!isOpen);
            }
        },
        [handleToggleClick, isOpen]
    );

    const onCloseClick = useCallback(
        (e: SyntheticEvent) => {
            e.stopPropagation();

            handleDeselectAll(e);
        },
        [handleDeselectAll]
    );

    const onCloseKeyDown = useCallback(
        (e: KeyboardEvent<HTMLDivElement>) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                e.stopPropagation();
                handleDeselectAll(e);
            }
        },
        [handleDeselectAll]
    );

    const selectedItemsCount = useMemo(
        () => selectedItems.length,
        [selectedItems.length]
    );

    const clearButtonAvailable = enableClearButton && !disabled;

    const content = useMemo(() => {
        return isOpen ? (
            <StyledToggleContent
                isOpen={isOpen}
                enableClearButton={clearButtonAvailable}
            >
                <StyledItemsWrapper size={size}>
                    {selectedItems.map((item: IFlatMenuItem) => (
                        <MultiToggleItem
                            key={`item_${item.id}`}
                            item={item}
                            size={size}
                            disabled={disabled}
                            selected={selectedItemId === item.id}
                            onClick={() => handleItemSelect(item.id)}
                            onClose={() => handleItemDelete(item.id)}
                        />
                    ))}
                </StyledItemsWrapper>
                <StyledToggleFilter
                    aria-label={ariaLabel}
                    onChange={handleChange}
                    value={filterValue || ''}
                    onClick={handleFilterClick}
                    onFocus={handleFilterFocus}
                    placeholder={
                        selectedItemsCount === 0
                            ? isOpen && expandedPlaceholder
                                ? expandedPlaceholder
                                : placeholder
                            : ''
                    }
                    ref={filterRef}
                />
            </StyledToggleContent>
        ) : (
            <MultiToggleContent
                {...{
                    width,
                    isOpen,
                    disabled,
                    enableClearButton: clearButtonAvailable,
                    selectedItems,
                    allSelected,
                    placeholder,
                    activePlaceholder,
                    selectedItemId,
                    allSelectedText,
                    handleItemDelete,
                    handleItemSelect,
                    selectedItemsCount,
                    size,
                    loading,
                }}
            />
        );
    }, [
        isOpen,
        ariaLabel,
        loading,
        clearButtonAvailable,
        selectedItems,
        handleChange,
        filterValue,
        handleFilterClick,
        handleFilterFocus,
        selectedItemsCount,
        placeholder,
        expandedPlaceholder,
        filterRef,
        width,
        disabled,
        allSelected,
        activePlaceholder,
        selectedItemId,
        allSelectedText,
        handleItemDelete,
        handleItemSelect,
        size,
    ]);

    return (
        <StyledMultiToggle
            size={size}
            isOpen={isOpen}
            disabled={disabled}
            onClick={onToggleClick}
            className='eui-dropdown-toggle'
            data-aid={TEST_AID.MULTI_DROPDOWN_TOGGLE}
        >
            {content}
            {clearButtonAvailable && (
                <StyledCloseIcon
                    onClick={onCloseClick}
                    onKeyDown={onCloseKeyDown}
                    tabIndex={0}
                    role='button'
                    aria-label='Remove all'
                    data-aid={TEST_AID.MULTI_TOGGLE_CLOSE_ICON}
                >
                    <CloseSvg data-aid={TEST_AID.MULTI_TOOGLE_CLOSE_BTN} />
                </StyledCloseIcon>
            )}
            {loading ? (
                <StyledSpinner size='small' />
            ) : (
                <StyledArrowIcon
                    direction={isOpen ? ArrowDirection.UP : ArrowDirection.DOWN}
                    disabled={disabled}
                />
            )}
        </StyledMultiToggle>
    );
};

export default memo(MultiToggle);
