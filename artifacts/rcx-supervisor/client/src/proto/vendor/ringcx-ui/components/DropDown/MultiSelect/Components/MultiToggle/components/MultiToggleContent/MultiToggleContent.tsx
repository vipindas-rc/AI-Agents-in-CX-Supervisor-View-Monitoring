import type { FC } from 'react';
import {
    memo,
    useRef,
    useState,
    useEffect,
    useCallback,
    useLayoutEffect,
    useMemo,
} from 'react';

import {
    ItemsWrapper,
    StyledCounter,
    ToggleContent,
} from './MultiToggleContent.styled';
import type {
    IToggleContent,
    IVisibleItems,
    IWidthSelectedItems,
} from './types';
import { TEST_AID } from '../../../../../../../constants';
import {
    COUNTER_MAX_WIDTH,
    DROPDOWN_PADDING_LEFT,
    ITEM_MARGIN_RIGHT,
} from '../../../../../constants';
import { StyledPlaceholder } from '../../../../../DropDown.styled';
import type { IFlatMenuItem } from '../../../../../types';
import { MultiToggleItem } from '../MultiToggleItem';

const MultiToggleContent: FC<IToggleContent> = ({
    width,
    allSelected,
    allSelectedText,
    selectedItemsCount,
    selectedItems,
    selectedItemId,
    disabled,
    enableClearButton,
    isOpen,
    placeholder,
    activePlaceholder,
    handleItemSelect,
    handleItemDelete,
    size,
}) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [visibleSelectedItems, setVisibleSelectedItems] = useState<
        Array<IFlatMenuItem>
    >([...selectedItems]);
    const [currentWidthSelectedItems, setCurrentWidthSelectedItems] =
        useState<Array<IWidthSelectedItems> | null>(null);
    const [hiddenCount, setHiddenCount] = useState<number>(0);

    const getDefaultValueVisibleItems = useCallback(
        (isShowCounter: boolean) => {
            return {
                visibleCount: 0,
                widthAllButton:
                    DROPDOWN_PADDING_LEFT +
                    (isShowCounter ? COUNTER_MAX_WIDTH : 0),
                hiddenCount: 0,
            };
        },
        []
    );

    const checkVisibleItems = useCallback(
        (
            widthsSelectedItems: Array<IWidthSelectedItems> | null,
            widthWrapper: number
        ): IVisibleItems => {
            if (!widthsSelectedItems || !widthsSelectedItems.length) {
                return {
                    visibleCount: Infinity,
                    widthAllButton: DROPDOWN_PADDING_LEFT,
                    hiddenCount: 0,
                };
            }

            const widthAllButton = widthsSelectedItems.reduce(
                (acc, current) => acc + current.width + ITEM_MARGIN_RIGHT,
                DROPDOWN_PADDING_LEFT
            );

            const defaultValueVisibleItems = getDefaultValueVisibleItems(
                widthAllButton - widthWrapper > 0
            );

            return widthsSelectedItems.reduce((acc: IVisibleItems, current) => {
                const widthCurrentBtn = current.width + ITEM_MARGIN_RIGHT;
                const widthAllButton = acc.widthAllButton + widthCurrentBtn;
                const visibleCount = acc.visibleCount + 1;

                return widthAllButton < widthWrapper
                    ? {
                          visibleCount,
                          widthAllButton,
                          hiddenCount: selectedItemsCount - visibleCount,
                      }
                    : {
                          ...acc,
                          widthAllButton,
                          hiddenCount: selectedItemsCount - acc.visibleCount,
                      };
            }, defaultValueVisibleItems);
        },
        [getDefaultValueVisibleItems, selectedItemsCount]
    );

    const getVisibleSelectedItems = useCallback(
        (visibleCount: number) =>
            [...selectedItems].slice(0, visibleCount !== 0 ? visibleCount : 1),
        [selectedItems]
    );

    const getHiddenCount = useCallback(
        (hiddenCount: number) =>
            hiddenCount !== selectedItems.length
                ? hiddenCount
                : hiddenCount - 1,
        [selectedItems]
    );

    useLayoutEffect(() => {
        if (wrapperRef && wrapperRef.current) {
            const div: HTMLElement = wrapperRef.current;
            const widthSelectedItems = Array.from(div.children).reduce<
                { id: string; width: number }[]
            >((acc, item, index) => {
                const selectedItem = selectedItems[index];
                if (selectedItem) {
                    acc.push({
                        id: selectedItems[index].id,
                        width: (item as HTMLElement).offsetWidth,
                    });
                }

                return acc;
            }, []);

            setCurrentWidthSelectedItems(widthSelectedItems);
        }
    }, [selectedItems]);

    useEffect(() => {
        if (wrapperRef && wrapperRef.current) {
            const div: HTMLElement = wrapperRef.current;
            const widthItems = Array.from(div.children).map(
                (item) => (item as HTMLElement).offsetWidth
            );

            setCurrentWidthSelectedItems((prevState) => {
                return (
                    prevState &&
                    prevState.map((item, index) => ({
                        ...item,
                        width: widthItems[index] || item.width,
                    }))
                );
            });
        }
    }, [width]);

    useLayoutEffect(() => {
        if (!selectedItems.length) {
            return;
        }

        if (wrapperRef && wrapperRef.current) {
            const div: HTMLElement = wrapperRef.current;
            const widthDiv = div.offsetWidth;

            const { visibleCount, hiddenCount } = checkVisibleItems(
                currentWidthSelectedItems,
                widthDiv
            );

            let newVisibleSelectedItems = getVisibleSelectedItems(visibleCount);
            let newHiddenCount = getHiddenCount(hiddenCount);

            if (visibleCount === Infinity && hiddenCount === 0) {
                const widthSelectedItems = Array.from(div.children).map(
                    (item, index) => {
                        return {
                            id: selectedItems[index]?.id,
                            width: (item as HTMLElement).offsetWidth,
                        };
                    }
                );

                const { visibleCount, hiddenCount } = checkVisibleItems(
                    widthSelectedItems,
                    widthDiv
                );

                newVisibleSelectedItems = getVisibleSelectedItems(visibleCount);
                newHiddenCount = getHiddenCount(hiddenCount);
            }

            setVisibleSelectedItems(newVisibleSelectedItems);
            setHiddenCount(newHiddenCount);
        }
    }, [
        width,
        selectedItems,
        checkVisibleItems,
        getVisibleSelectedItems,
        getHiddenCount,
        currentWidthSelectedItems,
    ]);

    const onDeleteItem = useCallback(
        (item: IFlatMenuItem) => {
            handleItemDelete(item.id);

            setCurrentWidthSelectedItems((prevState) => {
                if (prevState) {
                    return prevState.filter(
                        (selectedItem) => selectedItem.id !== item.id
                    );
                }

                return prevState;
            });
        },
        [handleItemDelete]
    );

    const content = useMemo(() => {
        if (selectedItemsCount === 0) {
            return (
                <StyledPlaceholder showExistItem={activePlaceholder}>
                    {placeholder}
                </StyledPlaceholder>
            );
        }

        if (allSelected && allSelectedText) {
            return <StyledPlaceholder>{allSelectedText}</StyledPlaceholder>;
        }

        return (
            <ItemsWrapper ref={wrapperRef} size={size}>
                {visibleSelectedItems.map((item: IFlatMenuItem) => (
                    <MultiToggleItem
                        key={`item_${item.id}`}
                        item={item}
                        size={size}
                        disabled={disabled}
                        selected={selectedItemId === item.id}
                        dataAid={`${TEST_AID.CHIP.PREFIX}-${item.id}`}
                        onClick={() => handleItemSelect(item.id)}
                        onClose={() => onDeleteItem(item)}
                    />
                ))}
                {hiddenCount > 0 && (
                    <StyledCounter disabled={disabled}>
                        {`+${hiddenCount}`}
                    </StyledCounter>
                )}
            </ItemsWrapper>
        );
    }, [
        activePlaceholder,
        allSelected,
        allSelectedText,
        disabled,
        handleItemSelect,
        hiddenCount,
        onDeleteItem,
        placeholder,
        selectedItemId,
        selectedItemsCount,
        size,
        visibleSelectedItems,
    ]);

    return (
        <ToggleContent
            isOpen={isOpen}
            hiddenCount={hiddenCount}
            enableClearButton={enableClearButton}
        >
            {content}
        </ToggleContent>
    );
};

export default memo(MultiToggleContent);
