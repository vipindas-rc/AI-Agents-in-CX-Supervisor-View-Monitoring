import type { FC, KeyboardEvent, FocusEvent } from 'react';
import {
    Fragment,
    memo,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';

import { useTranslation } from 'react-i18next';
import useOnClickOutside from 'use-onclickoutside';

import ActionsArea from './Components/ActionsArea';
import MultiToggle from './Components/MultiToggle';
import { MultiSelectBorder } from './MultiSelect.styled';
import { useWindowResizeHandler } from '../../../hooks/useWindowResizeHandler';
import { i18next } from '../../../services/translate';
import { FormControl } from '../../FormControl';
import SearchableList from '../Components/VirtualList';
import {
    ACTIONS_WRAPPER_HEIGHT,
    DROPDOWN_MARGIN,
    ITEM_HEIGHT,
    KEY_CODES,
    LIST_ITEM_EDGE_PADDING,
    LIST_ITEM_HEIGHT,
    LIST_ITEMS_COUNT,
    REMOVE_ITEM_DEFAULT_TIMEOUT,
    SMALL_ITEM_HEIGHT,
    SMALL_LIST_ITEM_HEIGHT,
    SMALL_TOGGLE_HEIGHT,
    TOGGLE_BORDER,
    TOGGLE_HEIGHT,
    TOGGLE_MAX_HEIGHT,
} from '../constants';
import { DropDownWrapper } from '../DropDown.styled';
import { filterItems, getFlatData } from '../helpers';
import type { IFlatMenuItem, IMultiSelectProps, OpenDirection } from '../types';

const MultiSelect: FC<IMultiSelectProps> = ({
    data,
    onChange,
    loading = false,
    activePlaceholder = false,
    disabled = false,
    enableClearButton = false,
    size = 'medium',
    width,
    selectedItemsIds = [],
    visibleItemsCount = LIST_ITEMS_COUNT,
    placeholder,
    expandedPlaceholder,
    noResultsFoundText,
    nothingAvailableText,
    loadingText,
    selectAllText,
    deselectAllText,
    allSelectedText,
    onOpen,
    onClose,
    title,
    ariaLabel,
    ariaLabelledBy,
    required = false,
    error,
    message,
    enableActions = true,
    useDefaultSort = true,
    fixedOpeningDirection = false,
    dataAid,
    i18n = i18next,
    ...props
}) => {
    const { t } = useTranslation(undefined, { i18n });
    const borderRef = useRef<HTMLDivElement>(null);
    const filterRef = useRef<HTMLInputElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [openDirection, setOpenDirection] = useState<OpenDirection>('down');

    const [pressedRemoveKeyCode, setPressedRemoveKeyCode] = useState<
        number | null
    >(null);
    const [deleteItemTimerId, setDeleteItemTimerId] = useState<number | null>(
        null
    );
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const [filterValue, setFilterValue] = useState<string | null>(null);
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [listScrollPosition, setListScrollPosition] = useState<number>(0);
    const [keyboardPositionItemId, setKeyboardPositionItemId] = useState<
        string | null
    >(null);
    const [selectedItemId, setSelectedItemId] = useState<
        IFlatMenuItem['id'] | null
    >(null);

    const [dropDownWidth, setDropDownWidth] = useState<number>(0);
    const [visibleItemsCountState, setVisibleItemsCountState] =
        useState<number>(visibleItemsCount);

    const SELECT_ALL_TEXT = selectAllText || t('GENERICS.MESSAGES.SELECT_ALL');
    const DESELECT_ALL_TEXT =
        deselectAllText || t('GENERICS.MESSAGES.DESELECT_ALL');
    const NO_RESULTS_FOUND_TEXT =
        noResultsFoundText || t('GENERICS.MESSAGES.NO_RESULTS_FOUND');
    const NOTHING_AVAILABLE_TEXT =
        nothingAvailableText || t('GENERICS.MESSAGES.NOTHING_AVAILABLE');
    const LOADING_TEXT = loadingText || t('GENERICS.MESSAGES.LOADING');
    const SELECT_PLACEHOLDER =
        placeholder !== undefined
            ? placeholder
            : t('GENERICS.MESSAGES.SELECT_PLACEHOLDER');

    const listItemHeight = useMemo(
        () => (size === 'medium' ? LIST_ITEM_HEIGHT : SMALL_LIST_ITEM_HEIGHT),
        [size]
    );

    const menuItems: IFlatMenuItem[] = useMemo(
        () => getFlatData(data, useDefaultSort),
        [data, useDefaultSort]
    );
    const availableMenuItems: IFlatMenuItem[] = useMemo(
        () => filterItems(menuItems, filterValue || '', selectedItemsIds),
        [menuItems, filterValue, selectedItemsIds]
    );
    const allSelected = availableMenuItems.length === 0;
    const selectedItems = useMemo((): IFlatMenuItem[] => {
        const result: IFlatMenuItem[] = [];

        selectedItemsIds.forEach((selectedItemId) => {
            const item = menuItems
                .filter((menuItem) => menuItem.itemType === 'item')
                .find((menuItem) => menuItem.id === selectedItemId);
            if (item) {
                result.push({ ...item });
            }
        });

        return result;
    }, [menuItems, selectedItemsIds]);

    const keyboardPositionIndex: number | null = useMemo(() => {
        const index = availableMenuItems.findIndex(
            (item: IFlatMenuItem) => item.id === keyboardPositionItemId
        );

        return index !== -1 ? index : null;
    }, [availableMenuItems, keyboardPositionItemId]);
    const getNextItemId = useCallback(
        (index: number): string | null => {
            const nextIndex = index + 1;

            if (
                availableMenuItems.length &&
                availableMenuItems[nextIndex].itemType === 'item'
            ) {
                return availableMenuItems[nextIndex].id;
            } else {
                return nextIndex < availableMenuItems.length - 1
                    ? getNextItemId(nextIndex)
                    : null;
            }
        },
        [availableMenuItems]
    );

    const getFirstItemId = useCallback(
        (): string | null => getNextItemId(-1),
        [getNextItemId]
    );

    const getPrevItemId = useCallback(
        (index: number): string | null => {
            const nextIndex = index - 1;
            if (
                availableMenuItems.length &&
                availableMenuItems[nextIndex].itemType === 'item'
            ) {
                return availableMenuItems[nextIndex].id;
            } else {
                return nextIndex > 0 ? getPrevItemId(nextIndex) : null;
            }
        },
        [availableMenuItems]
    );

    const closeAndResetState = useCallback(() => {
        if (isOpen) {
            setIsOpen(false);
            if (onClose) {
                onClose();
            }
            setSelectedItemId(null);
            setKeyboardPositionItemId(null);
            setFilterValue(null);
            setListScrollPosition(0);
        }
    }, [isOpen, onClose]);

    const deleteNextItem = (keyCode: number) => {
        setDeleteItemTimerId(null);

        if (selectedItemId === null && keyCode === KEY_CODES.backspace_code) {
            const lastSelectedItemId =
                selectedItemsIds[selectedItemsIds.length - 1];
            handleItemDelete(lastSelectedItemId, false);
            setSelectedItemId(null);
        } else if (selectedItemId !== null) {
            const selectedItemIndex = selectedItemsIds.findIndex(
                (itemId) => itemId === selectedItemId
            );

            handleItemDelete(selectedItemId, false);

            if (selectedItemIndex >= 0) {
                let itemIndex: null | string = null;

                if (
                    keyCode === KEY_CODES.backspace_code &&
                    selectedItemIndex !== 0
                ) {
                    itemIndex = selectedItemsIds[selectedItemIndex - 1];

                    focusToggleBtn();
                } else if (
                    keyCode === KEY_CODES.delete_code &&
                    selectedItemIndex !== selectedItemsIds.length - 1
                ) {
                    itemIndex = selectedItemsIds[selectedItemIndex + 1];

                    focusToggleBtn();
                } else {
                    focusFilter();
                }

                setSelectedItemId(itemIndex);
            }
        }
    };

    const focusToggleBtn = () => {
        if (borderRef && borderRef.current) {
            borderRef.current.focus();
        }
    };
    const focusFilter = (preventScroll = false) => {
        if (filterRef && filterRef.current) {
            filterRef.current.focus({ preventScroll });
        }
    };

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
                    itemsCount * listItemHeight + LIST_ITEM_EDGE_PADDING * 2;
                let toggleHeight = 0;
                const { length: selectedItemsLength } = selectedItems;
                if (selectedItemsLength > 0) {
                    const itemHeight =
                        size === 'medium' ? ITEM_HEIGHT : SMALL_ITEM_HEIGHT;
                    toggleHeight =
                        toggleHeight + itemHeight * selectedItemsLength >
                        TOGGLE_MAX_HEIGHT
                            ? TOGGLE_MAX_HEIGHT
                            : toggleHeight + itemHeight * selectedItemsLength;
                } else {
                    toggleHeight =
                        (size === 'medium'
                            ? TOGGLE_HEIGHT
                            : SMALL_TOGGLE_HEIGHT) -
                        2 * TOGGLE_BORDER;
                }
                const actionsWrapperHeight = enableActions
                    ? ACTIONS_WRAPPER_HEIGHT
                    : 0;
                const multiSelectHeight =
                    dropDownListHeight + toggleHeight + actionsWrapperHeight;
                const { bottom: toggleBottomPos, top: toggleTopPos } =
                    wrapperRef.current.getBoundingClientRect();
                const multiSelectBottomPos = toggleTopPos + multiSelectHeight;
                const possibleDeltaBottomPos =
                    windowHeight - multiSelectBottomPos;
                if (possibleDeltaBottomPos < DROPDOWN_MARGIN) {
                    // if no place for margin downwards
                    // count enough place upwards
                    const possibleDeltaTopPos =
                        toggleBottomPos - multiSelectHeight;
                    if (possibleDeltaTopPos < DROPDOWN_MARGIN) {
                        // if no place for margin downwards
                        // let's decide what direction MultiSelect should be opened to by calculating the biggest margin
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
                            ? 'up'
                            : 'down';
                    } else {
                        return 'up';
                    }
                } else {
                    return 'down';
                }
            }
            return oldDirection;
        });
    }, [
        availableMenuItems.length,
        enableActions,
        listItemHeight,
        selectedItems,
        size,
        visibleItemsCount,
    ]);

    // change count of visible items when MultiSelect is open
    const calculateNewVisibleItemsCount = useCallback(
        (newAvailableItemsCount: number) => {
            let newCount = visibleItemsCountState;
            if (borderRef.current && wrapperRef.current) {
                // count the margin between the edge of window and dropdown
                if (openDirection === 'down') {
                    const multiSelectBottomPos =
                        borderRef.current.getBoundingClientRect().bottom;
                    const windowHeight = document.documentElement.clientHeight;

                    // check if there is lack of space
                    if (multiSelectBottomPos + DROPDOWN_MARGIN > windowHeight) {
                        let redundantItemsCount = 0;
                        let newMultiSelectBottomPos = multiSelectBottomPos;

                        while (
                            newMultiSelectBottomPos + DROPDOWN_MARGIN >
                            windowHeight
                        ) {
                            newMultiSelectBottomPos -= listItemHeight;
                            redundantItemsCount++;
                        }
                        // decrease visibleItemsCountState
                        if (visibleItemsCountState > 1) {
                            newCount =
                                visibleItemsCountState > newAvailableItemsCount
                                    ? newAvailableItemsCount -
                                      redundantItemsCount
                                    : visibleItemsCountState -
                                      redundantItemsCount;
                        }
                        // check if there is enough space to add at least one visible items
                    } else if (
                        windowHeight -
                            (multiSelectBottomPos + listItemHeight) >=
                            DROPDOWN_MARGIN &&
                        newAvailableItemsCount > visibleItemsCountState
                    ) {
                        let additionalItemsCount = 0;
                        let newMultiSelectBottomPos = multiSelectBottomPos;
                        // try to add hypothetical item to the general height of the multiselect
                        while (
                            windowHeight -
                                (newMultiSelectBottomPos + listItemHeight) >=
                            DROPDOWN_MARGIN
                        ) {
                            newMultiSelectBottomPos += listItemHeight;
                            if (
                                visibleItemsCountState + additionalItemsCount <
                                visibleItemsCount
                            ) {
                                additionalItemsCount++;
                            } else {
                                break;
                            }
                        }
                        // increase visibleItemsCountState
                        newCount += additionalItemsCount;
                    }
                } else {
                    const multiSelectTopPos =
                        borderRef.current.getBoundingClientRect().top;

                    // check if there is lack of space
                    if (multiSelectTopPos < DROPDOWN_MARGIN) {
                        let redundantItemsCount = 0;
                        let newMultiSelectTopPos = multiSelectTopPos;

                        while (newMultiSelectTopPos < DROPDOWN_MARGIN) {
                            newMultiSelectTopPos += listItemHeight;
                            redundantItemsCount++;
                        }
                        // decrease visibleItemsCountState
                        if (visibleItemsCountState > 1) {
                            newCount =
                                visibleItemsCountState > newAvailableItemsCount
                                    ? newAvailableItemsCount -
                                      redundantItemsCount
                                    : visibleItemsCountState -
                                      redundantItemsCount;
                        }
                        // check if there is enough space to add at least one visible items
                    } else if (
                        multiSelectTopPos >= DROPDOWN_MARGIN + listItemHeight &&
                        newAvailableItemsCount > visibleItemsCountState
                    ) {
                        let additionalItemsCount = 0;
                        let newMultiSelectTopPos = multiSelectTopPos;

                        while (
                            newMultiSelectTopPos >=
                            DROPDOWN_MARGIN + listItemHeight
                        ) {
                            newMultiSelectTopPos -= listItemHeight;
                            if (
                                visibleItemsCountState + additionalItemsCount <
                                visibleItemsCount
                            ) {
                                additionalItemsCount++;
                            } else {
                                break;
                            }
                        }
                        // increase visibleItemsCountState
                        newCount += additionalItemsCount;
                    }
                }
            }
            setVisibleItemsCountState(newCount);
        },
        [
            listItemHeight,
            openDirection,
            visibleItemsCount,
            visibleItemsCountState,
        ]
    );

    const handleToggleClick = useCallback(() => {
        if (!disabled) {
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
        disabled,
        isOpen,
        closeAndResetState,
        fixedOpeningDirection,
        calculateDropDownOpeningDirection,
    ]);

    const handleFilterFocus = useCallback(() => {
        if (!disabled && isOpen) {
            setSelectedItemId(null);
        }
    }, [isOpen, disabled]);

    const handleFilterChange = useCallback(
        (nextFilterValue: string) => {
            if (nextFilterValue && nextFilterValue.length) {
                if (availableMenuItems && availableMenuItems.length) {
                    setKeyboardPositionItemId(getFirstItemId());
                } else {
                    setKeyboardPositionItemId(null);
                }
            } else {
                setKeyboardPositionItemId(getFirstItemId());
            }

            setFilterValue(nextFilterValue);
        },
        [availableMenuItems, getFirstItemId]
    );

    const handleKeyDown = (e: KeyboardEvent) => {
        if (!disabled) {
            const { keyCode } = e;

            const isEnter = keyCode === KEY_CODES.enter;
            const isEscape = keyCode === KEY_CODES.escape;
            const isTab = keyCode === KEY_CODES.tab;
            const isGoForward = keyCode === KEY_CODES.down_arrow;
            const isGoBack = keyCode === KEY_CODES.up_arrow;
            const isDelete = keyCode === KEY_CODES.delete_code;
            const isBackspace = keyCode === KEY_CODES.backspace_code;

            const oneOfNavControls =
                isEscape || isEnter || isGoForward || isGoBack || isTab;
            const oneOfRemoveControls = isDelete || isBackspace;

            const itemsCount = availableMenuItems.length;

            // Allow native button behavior (Enter/Space), but handle Tab separately
            const isFocusOnButton =
                document.activeElement instanceof HTMLButtonElement;

            if (isFocusOnButton && !isTab) {
                return;
            }

            if (isOpen && itemsCount === 0 && (isEnter || isEscape)) {
                closeAndResetState();

                focusToggleBtn();
            }

            if (isEnter && !isOpen) {
                setIsOpen(true);
            }

            if (
                (!oneOfRemoveControls &&
                    (!isOpen || !oneOfNavControls || itemsCount === 0)) ||
                (oneOfRemoveControls && !isOpen)
            ) {
                return;
            }

            if (!oneOfRemoveControls && !isTab) {
                e.preventDefault();
            }

            let index =
                keyboardPositionIndex !== null ? keyboardPositionIndex : -1;
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

            let nextItemId = null;

            if (isGoForward) {
                if (
                    (index !== keyboardPositionIndex &&
                        hoveredIndex === itemsCount - 1) ||
                    (index === keyboardPositionIndex &&
                        keyboardPositionIndex === itemsCount - 1)
                ) {
                    return;
                }

                nextItemId = getNextItemId(index);
                setKeyboardPositionItemId(nextItemId);

                if (setSelectedItemId !== null) {
                    setSelectedItemId(null);
                    focusFilter();
                }
            }

            if (isGoBack) {
                if (
                    (index !== keyboardPositionIndex && hoveredIndex === 0) ||
                    (index === keyboardPositionIndex &&
                        keyboardPositionItemId === getFirstItemId()) ||
                    (hoveredIndex === null && keyboardPositionIndex === null)
                ) {
                    return;
                }

                nextItemId = getPrevItemId(index);
                setKeyboardPositionItemId(nextItemId);

                if (setSelectedItemId !== null) {
                    setSelectedItemId(null);
                    focusFilter();
                }
            }

            if (isEnter && keyboardPositionIndex !== null) {
                handleMenuItemSelect(
                    availableMenuItems[keyboardPositionIndex],
                    keyboardPositionIndex
                );
            }
            if (isEscape) {
                closeAndResetState();

                focusToggleBtn();
            }

            if (
                selectedItems.length &&
                oneOfRemoveControls &&
                !pressedRemoveKeyCode &&
                (!filterValue || selectedItemId !== null)
            ) {
                setPressedRemoveKeyCode(keyCode);

                if (e.repeat && !deleteItemTimerId) {
                    setDeleteItemTimerId(
                        window.setTimeout(() => {
                            deleteNextItem(keyCode);
                        }, REMOVE_ITEM_DEFAULT_TIMEOUT)
                    );
                } else {
                    deleteNextItem(keyCode);
                }
            }
        }
    };

    const handleKeyUp = useCallback(
        (e: KeyboardEvent) => {
            if (!disabled) {
                const { keyCode } = e;

                const isDelete = keyCode === KEY_CODES.delete_code;
                const isBackspace = keyCode === KEY_CODES.backspace_code;

                if (deleteItemTimerId && (isBackspace || isDelete)) {
                    window.clearTimeout(deleteItemTimerId);
                    setDeleteItemTimerId(null);

                    setPressedRemoveKeyCode(null);
                }
            }
        },
        [deleteItemTimerId, disabled]
    );

    // Close dropdown when Tab moves focus outside the component
    // Allow Tab navigation inside (filter -> buttons -> list items)
    const handleBlur = useCallback(
        (e: FocusEvent) => {
            if (!disabled && isOpen) {
                const { relatedTarget } = e;
                const isFocusStillInside =
                    relatedTarget &&
                    wrapperRef.current?.contains(relatedTarget);

                if (!isFocusStillInside) {
                    closeAndResetState();
                }
            }
        },
        [closeAndResetState, disabled, isOpen]
    );

    const handleMenuItemSelect = useCallback(
        (item: IFlatMenuItem, index: number) => {
            const maxAvailableIndex = availableMenuItems.length - 1;
            let nextItemId: string | null;

            if (maxAvailableIndex === 0) {
                nextItemId = null;
            } else if (index < maxAvailableIndex) {
                nextItemId = getNextItemId(index);
            } else {
                nextItemId = getPrevItemId(maxAvailableIndex);
            }

            setHoveredIndex(null);
            setKeyboardPositionItemId(nextItemId);

            focusFilter();

            if (selectedItemId !== null) {
                setSelectedItemId(null);
            }

            calculateNewVisibleItemsCount(availableMenuItems.length + 1);

            onChange([...selectedItemsIds, item.id]);
        },
        [
            availableMenuItems.length,
            selectedItemId,
            calculateNewVisibleItemsCount,
            onChange,
            selectedItemsIds,
            getNextItemId,
            getPrevItemId,
        ]
    );

    const handleItemDelete = useCallback(
        (itemId: IFlatMenuItem['id'], clearItemSelection = true) => {
            if (isOpen) {
                calculateNewVisibleItemsCount(availableMenuItems.length - 1);
            }

            if (selectedItemId === itemId && clearItemSelection) {
                setSelectedItemId(null);
            }

            const nextSelectedItemsIds = selectedItemsIds.filter(
                (selectedItemId) => selectedItemId !== itemId
            );

            if (isOpen && selectedItemId === itemId) {
                focusFilter(true);
            }

            onChange(nextSelectedItemsIds);
        },
        [
            isOpen,
            selectedItemId,
            selectedItemsIds,
            onChange,
            calculateNewVisibleItemsCount,
            availableMenuItems.length,
        ]
    );

    const handleItemSelect = useCallback(
        (itemId: IFlatMenuItem['id']) => {
            if (isOpen && !disabled) {
                setSelectedItemId(itemId);
            }
        },
        [isOpen, disabled]
    );

    const handleSelectAll = useCallback(() => {
        onChange([
            ...selectedItemsIds,
            ...availableMenuItems.reduce(
                (memo, menuItem) => {
                    if (menuItem.itemType === 'item') {
                        memo.push(menuItem.id);
                    }
                    return memo;
                },
                [] as IFlatMenuItem['id'][]
            ),
        ]);

        focusFilter();
    }, [onChange, selectedItemsIds, availableMenuItems]);

    const handleDeselectAll = useCallback(() => {
        if (isOpen) {
            calculateNewVisibleItemsCount(menuItems.length);
        }
        onChange([]);
        focusFilter();
    }, [calculateNewVisibleItemsCount, isOpen, menuItems.length, onChange]);

    if (pressedRemoveKeyCode && deleteItemTimerId === null) {
        setDeleteItemTimerId(
            window.setTimeout(
                () => deleteNextItem(pressedRemoveKeyCode),
                REMOVE_ITEM_DEFAULT_TIMEOUT / 2
            )
        );
    }

    useEffect(() => {
        if (wrapperRef.current) {
            setDropDownWidth(wrapperRef.current.clientWidth);
        }
    }, [wrapperRef]);

    useEffect(() => {
        if (isOpen && filterValue !== null) {
            if (filterValue && filterValue.length) {
                if (availableMenuItems && availableMenuItems.length) {
                    setKeyboardPositionItemId(getFirstItemId());
                } else {
                    setKeyboardPositionItemId(null);
                }
            } else {
                setKeyboardPositionItemId(getFirstItemId());
            }
        }
    }, [availableMenuItems, filterValue, getFirstItemId, isOpen]);

    useEffect(() => {
        if (isOpen && onOpen) {
            onOpen({ wrapperRef, borderRef });
        }
        if (!isOpen) {
            // reset to default state when closed
            setVisibleItemsCountState(visibleItemsCount);
            setOpenDirection('down');
        }
    }, [isOpen, onOpen, visibleItemsCount]);

    useOnClickOutside(wrapperRef, closeAndResetState);

    const multiToggleWidth = useMemo(
        () => width || dropDownWidth,
        [width, dropDownWidth]
    );

    const resizeHandler = useCallback(() => {
        if (
            wrapperRef.current &&
            wrapperRef.current.clientWidth !== dropDownWidth
        ) {
            setDropDownWidth(wrapperRef.current.clientWidth);
        }
    }, [dropDownWidth]);

    useWindowResizeHandler(resizeHandler);

    return (
        <FormControl
            {...{
                title,
                required,
                error,
                message,
                dataAid,
            }}
        >
            <DropDownWrapper
                {...{
                    ref: wrapperRef,
                    isOpen,
                    size,
                    disabled,
                    onKeyDown: handleKeyDown,
                    onKeyUp: handleKeyUp,
                    onBlur: handleBlur,
                    ...props,
                }}
            >
                <MultiSelectBorder
                    {...{
                        ref: borderRef,
                        isOpen,
                        error,
                        disabled,
                        className: `eui-dropdown multi-select ${
                            isOpen ? 'is-open' : ''
                        }`,
                        tabIndex: disabled ? -1 : 0,
                        openDirection,
                        ...(ariaLabelledBy && {
                            'aria-labelledby': ariaLabelledBy,
                        }),
                        ...(ariaLabel && { 'aria-label': ariaLabel }),
                    }}
                    data-aid={`${dataAid ?? 'multiSelect'}DropDown`}
                >
                    <MultiToggle
                        {...{
                            width: multiToggleWidth,
                            size,
                            isOpen,
                            disabled,
                            filterRef,
                            placeholder: SELECT_PLACEHOLDER,
                            expandedPlaceholder,
                            ariaLabel:
                                ariaLabel ||
                                (ariaLabelledBy ? undefined : title),
                            filterValue,
                            allSelected,
                            enableClearButton:
                                enableClearButton && !!selectedItems.length,
                            allSelectedText,
                            activePlaceholder,
                            selectedItems,
                            selectedItemId,
                            handleItemDelete,
                            handleItemSelect,
                            handleToggleClick,
                            handleFilterFocus,
                            handleDeselectAll,
                            handleFilterChange,
                            loading,
                        }}
                    />
                    {isOpen && (
                        <Fragment>
                            {enableActions &&
                            (availableMenuItems.length > 0 ||
                                selectedItemsIds.length > 0) ? (
                                <ActionsArea
                                    {...{
                                        selectAllText: SELECT_ALL_TEXT,
                                        deselectAllText: DESELECT_ALL_TEXT,
                                        allSelected,
                                        nothingSelected:
                                            selectedItemsIds.length === 0,
                                        onSelectAll: handleSelectAll,
                                        onDeselectAll: handleDeselectAll,
                                    }}
                                />
                            ) : null}
                            <SearchableList
                                {...{
                                    menuItems,
                                    availableMenuItems,
                                    keyboardPositionIndex,
                                    handleMenuItemSelect,
                                    visibleItemsCount: visibleItemsCountState,
                                    width,
                                    listItemHeight,
                                    noResultsFoundText: NO_RESULTS_FOUND_TEXT,
                                    nothingAvailableText: loading
                                        ? LOADING_TEXT
                                        : NOTHING_AVAILABLE_TEXT,
                                    listScrollPosition,
                                    setListScrollPosition,
                                    setHoveredIndex,
                                    openDirection,
                                }}
                            />
                        </Fragment>
                    )}
                </MultiSelectBorder>
            </DropDownWrapper>
        </FormControl>
    );
};

export default memo(MultiSelect);
