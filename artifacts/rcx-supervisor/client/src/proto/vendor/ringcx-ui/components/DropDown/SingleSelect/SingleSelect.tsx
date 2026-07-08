import type { KeyboardEvent } from 'react';
import {
    forwardRef,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useTranslation } from 'react-i18next';
import useOnClickOutside from 'use-onclickoutside';

import DropdownToggle from './Components/DropdownToggle';
import ToggleSpacer from './Components/ToggleSpacer/ToggleSpacer';
import { UNUSED } from '../../../helpers/usage';
import { i18next } from '../../../services/translate';
import Adornment from '../../Adornment';
import { FormControl } from '../../FormControl';
import VirtualList from '../Components/VirtualList';
import {
    DROPDOWN_MARGIN,
    KEY_CODES,
    LIST_ITEM_EDGE_PADDING,
    LIST_ITEM_HEIGHT,
    LIST_ITEMS_COUNT,
    SMALL_LIST_ITEM_HEIGHT,
    SMALL_TOGGLE_HEIGHT,
    TOGGLE_HEIGHT,
} from '../constants';
import {
    DropDownBorder,
    DropDownWrapper,
    StyledDropDownWrapper,
} from '../DropDown.styled';
import { filterItems, getFlatData } from '../helpers';
import type {
    IFlatMenuItem,
    ISingleSelectProps,
    OpenDirection,
} from '../types';

enum OpeningDirection {
    UP = 'up',
    DOWN = 'down',
}

const SingleSelect = forwardRef<HTMLInputElement, ISingleSelectProps>(
    (
        {
            data,
            onChange,
            placeholder,
            activePlaceholder = false,
            disabled = false,
            isSearchable = false,
            size = 'medium',
            width,
            selectedItemId = null,
            visibleItemsCount = LIST_ITEMS_COUNT,
            noResultsFoundText,
            nothingAvailableText,
            useDefaultSort = true,
            onOpen,
            onBlur,
            onFocus,
            onClose,
            title,
            required = false,
            error,
            message,
            formWidth,
            loading,
            loadingPlaceholder,
            fixedOpeningDirection = false,
            endAdornment,
            fieldNameTooltip,
            enableClearButton = false,
            dataAid,
            hideDropdownToggleIfOpen = false,
            openingDirection,
            tooltipPlacement,
            ariaLabel,
            ariaLabelledBy,
            forceFocus = false,
            i18n = i18next,
            ...props
        },
        ref
    ) => {
        //The component doesn't use conventional input, so nowhere to pass this
        UNUSED(ref);

        const menuItems: IFlatMenuItem[] = useMemo(
            () => getFlatData(data, useDefaultSort),
            [data, useDefaultSort]
        );

        const listItemHeight = useMemo(
            () =>
                size === 'medium' ? LIST_ITEM_HEIGHT : SMALL_LIST_ITEM_HEIGHT,
            [size]
        );

        const [isOpen, setIsOpen] = useState<boolean>(false);
        const [openDirection, setOpenDirection] = useState<OpenDirection>(
            openingDirection ?? OpeningDirection.DOWN
        );
        const [filterValue, setFilterValue] = useState<string>('');
        const [keyboardPositionIndex, setKeyboardPositionIndex] = useState<
            number | null
        >(null);
        const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
        const [listScrollPosition, setListScrollPosition] = useState<number>(0);
        const [availableMenuItems, setAvailableMenuItems] =
            useState<IFlatMenuItem[]>(menuItems);
        const [visibleItemsCountState, setVisibleItemsCountState] =
            useState<number>(visibleItemsCount);

        const borderRef = useRef<HTMLDivElement>(null);
        const wrapperRef = useRef<HTMLDivElement>(null);
        const { t } = useTranslation(undefined, { i18n });

        const SELECT_PLACEHOLDER =
            placeholder !== undefined
                ? placeholder
                : t('GENERICS.MESSAGES.SELECT_PLACEHOLDER');
        const NO_RESULTS_FOUND_TEXT =
            noResultsFoundText || t('GENERICS.MESSAGES.NO_RESULTS_FOUND');
        const NOTHING_AVAILABLE_TEXT =
            nothingAvailableText || t('GENERICS.MESSAGES.NOTHING_AVAILABLE');

        const selectedItem =
            menuItems.find(
                (item: IFlatMenuItem) =>
                    item.itemType !== 'group' && item.id === selectedItemId
            ) || null;

        const toggleText = selectedItem
            ? selectedItem.displayName
            : SELECT_PLACEHOLDER;
        const toggleMode = selectedItem ? selectedItem.variant : undefined;

        const currentItem =
            keyboardPositionIndex !== null
                ? availableMenuItems[keyboardPositionIndex]
                : null;
        let currentItemName: string | null =
            currentItem && currentItem.displayName;

        useEffect(() => {
            const nextKeyboardPositionIndex = menuItems.findIndex(
                (rawItem: IFlatMenuItem) => rawItem.id === selectedItemId
            );
            setKeyboardPositionIndex(nextKeyboardPositionIndex);
        }, [setKeyboardPositionIndex, selectedItemId, menuItems]);

        const getActiveIndex = useCallback(
            () =>
                menuItems.findIndex(
                    (item: IFlatMenuItem) => item.id === selectedItemId
                ) || null,
            [menuItems, selectedItemId]
        );

        const calculateDropDownOpeningDirection = useCallback(() => {
            setOpenDirection((oldDirection) => {
                if (wrapperRef.current) {
                    // let's count margin bottom
                    const windowHeight = document.documentElement.clientHeight;
                    const itemsCount =
                        availableMenuItems.length > visibleItemsCount
                            ? visibleItemsCount
                            : availableMenuItems.length;
                    const dropDownListHeight =
                        itemsCount * listItemHeight +
                        LIST_ITEM_EDGE_PADDING * 2;
                    const toggleHeight =
                        size === 'medium' ? TOGGLE_HEIGHT : SMALL_TOGGLE_HEIGHT;

                    const selectHeight = dropDownListHeight + toggleHeight;
                    const { bottom: toggleBottomPos, top: toggleTopPos } =
                        wrapperRef.current.getBoundingClientRect();
                    const selectBottomPos = toggleTopPos + selectHeight;
                    const possibleDeltaBottomPos =
                        windowHeight - selectBottomPos;
                    if (possibleDeltaBottomPos < DROPDOWN_MARGIN) {
                        // if no place for margin downwards
                        // count enough place upwards
                        const possibleDeltaTopPos =
                            toggleBottomPos - selectHeight;
                        if (possibleDeltaTopPos < DROPDOWN_MARGIN) {
                            // if no place for margin downwards
                            // let's decide what direction SingleSelect should be opened to by calculating the biggest margin
                            let redundantItemsCount = 0;
                            let maximumDelta = Math.max(
                                possibleDeltaTopPos,
                                possibleDeltaBottomPos
                            );

                            // imagine if we increase the delta by listItemHeight
                            // and with every increasing reduce the count of visible items
                            // till delta is either equal or bigger DROPDOWN_MARGIN
                            while (maximumDelta < DROPDOWN_MARGIN) {
                                maximumDelta += listItemHeight;
                                redundantItemsCount++;
                            }
                            // decrease visibleItemsCountState
                            setVisibleItemsCountState((count) => {
                                // to pass test
                                if (count < redundantItemsCount) {
                                    return count;
                                }
                                return count - redundantItemsCount;
                            });
                            // define the most fit direction
                            return possibleDeltaTopPos > possibleDeltaBottomPos
                                ? OpeningDirection.UP
                                : OpeningDirection.DOWN;
                        } else {
                            return OpeningDirection.UP;
                        }
                    } else {
                        return OpeningDirection.DOWN;
                    }
                }
                return oldDirection;
            });
        }, [
            availableMenuItems.length,
            listItemHeight,
            size,
            visibleItemsCount,
        ]);

        const closeAndResetState = useCallback(() => {
            if (isOpen) {
                setIsOpen(false);
                if (onClose) {
                    onClose();
                }
                setKeyboardPositionIndex(getActiveIndex());

                if (currentItemName) {
                    // eslint-disable-next-line react-hooks/exhaustive-deps
                    currentItemName = null;
                }
                setFilterValue('');
                setAvailableMenuItems(menuItems);
                setListScrollPosition(0);
            }
        }, [isOpen, menuItems]);

        const getNextItemIndex = useCallback(
            (index: number): number => {
                const nextIndex = index + 1;
                if (availableMenuItems[nextIndex].itemType === 'item') {
                    return nextIndex;
                } else {
                    return nextIndex < availableMenuItems.length - 1
                        ? getNextItemIndex(nextIndex)
                        : index;
                }
            },
            [availableMenuItems]
        );

        const getFirstItemIndex = useCallback(
            (): number => getNextItemIndex(-1),
            [getNextItemIndex]
        );

        const getPrevItemIndex = (index: number): number => {
            const nextIndex = index - 1;
            if (availableMenuItems[nextIndex].itemType === 'item') {
                return nextIndex;
            } else {
                return nextIndex > 0 ? getPrevItemIndex(nextIndex) : index;
            }
        };

        const focusToggleBtn = () => {
            if (borderRef && borderRef.current) {
                borderRef.current.focus();
            }
        };

        const handleToggleClick = useCallback(() => {
            if (!disabled && !loading) {
                if (isOpen) {
                    closeAndResetState();
                } else {
                    if (!fixedOpeningDirection) {
                        calculateDropDownOpeningDirection();
                    }
                    setIsOpen(true);
                }
            }
        }, [
            isOpen,
            loading,
            disabled,
            closeAndResetState,
            fixedOpeningDirection,
            calculateDropDownOpeningDirection,
        ]);

        const handleFilterChange = useCallback(
            (nextFilterValue: string) => {
                if (nextFilterValue && nextFilterValue.length) {
                    if (availableMenuItems && availableMenuItems.length) {
                        setKeyboardPositionIndex(getFirstItemIndex());
                    } else {
                        setKeyboardPositionIndex(null);
                    }
                } else {
                    setKeyboardPositionIndex(getActiveIndex());
                }

                setFilterValue(nextFilterValue);
                const nextMenuItems = filterItems(menuItems, nextFilterValue);

                setAvailableMenuItems(nextMenuItems);
            },
            [menuItems, availableMenuItems, getFirstItemIndex, getActiveIndex]
        );

        const handleKeyDown = (e: KeyboardEvent) => {
            if (disabled) {
                return;
            }

            const { keyCode } = e;

            const isEnter = keyCode === KEY_CODES.enter;
            const isEscape = keyCode === KEY_CODES.escape;
            const isTab = keyCode === KEY_CODES.tab;
            const isGoForward = keyCode === KEY_CODES.down_arrow;
            const isGoBack = keyCode === KEY_CODES.up_arrow;

            const oneOfControls =
                isEscape || isEnter || isGoForward || isGoBack || isTab;
            const itemsCount = availableMenuItems.length;

            if (isOpen && itemsCount === 0 && (isEnter || isEscape || isTab)) {
                closeAndResetState();

                focusToggleBtn();
            }

            if (isEnter && !isOpen) {
                setIsOpen(true);
            }

            if (!isOpen || !oneOfControls || itemsCount === 0) {
                return;
            }

            e.preventDefault();

            let index = keyboardPositionIndex;
            let nextIndex = null;

            if (index === null) {
                const activeIndex = getActiveIndex();
                index = activeIndex || 0;
            }

            if (hoveredIndex !== null && !e.repeat) {
                const scrolledCount =
                    (listScrollPosition -
                        (listScrollPosition % listItemHeight)) /
                    listItemHeight;
                if (index > scrolledCount + visibleItemsCount - 1) {
                    index = hoveredIndex;
                } else if (index < scrolledCount) {
                    index = hoveredIndex;
                }
            }

            if (isGoForward) {
                if (
                    (index !== keyboardPositionIndex &&
                        hoveredIndex === itemsCount - 1) ||
                    keyboardPositionIndex === itemsCount - 1
                ) {
                    return;
                }
                nextIndex = getNextItemIndex(index);
                setKeyboardPositionIndex(nextIndex);
            }

            if (isGoBack) {
                if (
                    (index !== keyboardPositionIndex && hoveredIndex === 0) ||
                    keyboardPositionIndex === 0 ||
                    keyboardPositionIndex === null
                ) {
                    return;
                }
                nextIndex = getPrevItemIndex(index);
                setKeyboardPositionIndex(nextIndex);
            }

            if (isEnter && keyboardPositionIndex !== null) {
                handleMenuItemSelect(availableMenuItems[keyboardPositionIndex]);
                focusToggleBtn();
            }
            if (isEscape || isTab) {
                closeAndResetState();

                focusToggleBtn();
            }
        };

        const handleMenuItemSelect = useCallback(
            (item: IFlatMenuItem) => {
                setIsOpen(false);
                if (onClose) {
                    onClose();
                }
                handleFilterChange('');
                setListScrollPosition(0);
                focusToggleBtn();
                if (item) {
                    if (item.id !== selectedItemId) {
                        onChange(item.id);
                    }
                }
            },
            [onClose, handleFilterChange, selectedItemId, onChange]
        );

        const showExistItem =
            ![null, ''].includes(selectedItemId) ||
            ![null, -1].includes(keyboardPositionIndex);

        useOnClickOutside(wrapperRef, closeAndResetState);

        useEffect(() => {
            setKeyboardPositionIndex(getActiveIndex());
        }, [selectedItemId, getActiveIndex]);

        useEffect(() => {
            const filteredItems = filterItems(menuItems, filterValue);
            setAvailableMenuItems(filteredItems);
            if (filterValue && filteredItems.length) {
                setKeyboardPositionIndex(getFirstItemIndex());
            }
            // filterValue should not be a part of dependencies here.
            // It only requires to be updated when menuItems are updated.
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, [menuItems]);

        useEffect(() => {
            if (isOpen && onOpen) {
                onOpen({ wrapperRef, borderRef });
            }
            if (!isOpen) {
                // reset to default state when closed
                setVisibleItemsCountState(visibleItemsCount);
                setOpenDirection(openingDirection ?? OpeningDirection.DOWN);
            }
        }, [isOpen, onOpen, visibleItemsCount, openingDirection]);

        const toggleIcon = useMemo(
            () =>
                data.items.find((menuItem) => menuItem.id === selectedItemId)
                    ?.icon,
            [data.items, selectedItemId]
        );

        useEffect(() => {
            if (forceFocus) {
                focusToggleBtn();
            }
        }, [forceFocus]);

        return (
            <FormControl
                {...{
                    title,
                    required,
                    error,
                    message,
                    formWidth,
                    dataAid,
                    tooltip: fieldNameTooltip,
                    showRequiredAsterisk: required,
                }}
            >
                <StyledDropDownWrapper>
                    <DropDownWrapper
                        {...{
                            ref: wrapperRef,
                            width,
                            size,
                            isOpen,
                            disabled: disabled || Boolean(loading),
                            onKeyDown: handleKeyDown,
                            endAdornment,
                            ...props,
                        }}
                    >
                        {isOpen && (
                            <ToggleSpacer
                                {...{
                                    isOpen,
                                    size,
                                    placeholder: currentItemName || toggleText,
                                }}
                            />
                        )}
                        <DropDownBorder
                            {...{
                                error,
                                ref: borderRef,
                                isOpen,
                                disabled: disabled || Boolean(loading),
                                className:
                                    `eui-dropdown single-select ${
                                        isOpen ? 'is-open' : ''
                                    }` + (error ? 'single-select-error' : ''),
                                tabIndex: disabled || Boolean(loading) ? -1 : 0,
                                openDirection,
                                onBlur,
                                onFocus,
                                ...(ariaLabelledBy && {
                                    'aria-labelledby': ariaLabelledBy,
                                }),
                                ...(ariaLabel && { 'aria-label': ariaLabel }),
                            }}
                        >
                            {(!hideDropdownToggleIfOpen || !isOpen) && (
                                <DropdownToggle
                                    {...{
                                        size,
                                        isOpen,
                                        disabled: disabled || Boolean(loading),
                                        filterValue,
                                        placeholder:
                                            currentItemName || toggleText,
                                        placeholderVariant: toggleMode,
                                        activePlaceholder,
                                        loadingPlaceholder,
                                        showExistItem,
                                        isSearchable,
                                        handleFilterChange,
                                        handleToggleClick,
                                        loading,
                                        onChange,
                                        enableClearButton:
                                            !!selectedItemId &&
                                            enableClearButton,
                                        toggleIcon,
                                        tooltipPlacement,
                                        ariaLabel,
                                        ariaLabelledBy,
                                    }}
                                />
                            )}
                            {isOpen && (
                                <VirtualList
                                    {...{
                                        menuItems,
                                        availableMenuItems,
                                        selectedItemId,
                                        keyboardPositionIndex,
                                        handleMenuItemSelect,
                                        visibleItemsCount:
                                            visibleItemsCountState,
                                        width,
                                        listItemHeight,
                                        noResultsFoundText:
                                            NO_RESULTS_FOUND_TEXT,
                                        nothingAvailableText:
                                            NOTHING_AVAILABLE_TEXT,
                                        listScrollPosition,
                                        setHoveredIndex,
                                        setListScrollPosition,
                                        openDirection,
                                    }}
                                />
                            )}
                        </DropDownBorder>
                    </DropDownWrapper>
                    {endAdornment && Object.keys(endAdornment).length && (
                        <Adornment
                            tooltipMessage={endAdornment.tooltipMessage}
                            icon={endAdornment.icon}
                            size={size}
                            placement={endAdornment.placement}
                        />
                    )}
                </StyledDropDownWrapper>
            </FormControl>
        );
    }
);

export default memo(SingleSelect);
