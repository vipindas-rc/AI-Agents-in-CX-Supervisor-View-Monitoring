import type { ReactNode } from 'react';
import { memo, useRef, useEffect, useCallback } from 'react';

import type { IVirtualList } from './types';
import { StyledListMessage } from './VirtualList.styled';
import { TEST_AID } from '../../../../constants/index';
import VirtualScroll from '../../../VirtualScroll';
import { LIST_ITEM_EDGE_PADDING } from '../../constants';
import { StyledList } from '../../DropDown.styled';
import type { IFlatMenuItem } from '../../types';
import ListGroup from '../ListGroup';
import ListItem from '../ListItem';

const VirtualList = ({
    menuItems,
    availableMenuItems,
    keyboardPositionIndex,
    width,
    listItemHeight,
    handleMenuItemSelect,
    setHoveredIndex,
    visibleItemsCount,
    listScrollPosition,
    setListScrollPosition,
    noResultsFoundText,
    nothingAvailableText,
    openDirection,
    selectedItemId = null,
}: IVirtualList) => {
    const listRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (
            listRef &&
            listRef.current &&
            (keyboardPositionIndex || keyboardPositionIndex === 0)
        ) {
            const scrolledCount =
                (listScrollPosition - (listScrollPosition % listItemHeight)) /
                listItemHeight;
            if (keyboardPositionIndex > scrolledCount + visibleItemsCount - 1) {
                listRef.current.scrollTop =
                    keyboardPositionIndex * listItemHeight;
            } else if (keyboardPositionIndex < scrolledCount) {
                const nextOffsetItem = Math.max(
                    keyboardPositionIndex - visibleItemsCount + 1,
                    0
                );
                listRef.current.scrollTop = nextOffsetItem * listItemHeight;
            }
        }
        // To avoid circular updates do not add a dependency from listScrollPosition
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
        keyboardPositionIndex,
        visibleItemsCount,
        availableMenuItems,
        listItemHeight,
    ]);

    const renderRow = useCallback(
        (item: IFlatMenuItem, index: number) => {
            if (item.itemType === 'group') {
                return (
                    <ListGroup
                        {...{
                            key: `menu_group_${index}_${item.id}`,
                            item,
                            index,
                            onMouseEnter: () => setHoveredIndex(index),
                            listItemHeight,
                            role: 'presentation',
                        }}
                    />
                );
            }

            return (
                <ListItem
                    {...{
                        key: `menu_item_${index}_${item.id}`,
                        item,
                        index,
                        isSelected: selectedItemId === item.id,
                        keyboardPositionIndex,
                        handleMenuItemSelect,
                        onMouseEnter: () => setHoveredIndex(index),
                        listItemHeight,
                    }}
                />
            );
        },
        [
            selectedItemId,
            keyboardPositionIndex,
            handleMenuItemSelect,
            listItemHeight,
            setHoveredIndex,
        ]
    );

    const renderListWrapper = (
        getRows: () => ReactNode,
        compensationTop: number,
        compensationBottom: number
    ) => (
        <div
            style={{
                paddingTop: `${compensationTop}px`,
                paddingBottom: `${compensationBottom}px`,
            }}
            onMouseLeave={() => setHoveredIndex(null)}
            role='menu'
        >
            {getRows()}
        </div>
    );

    let list;

    if (menuItems.length === 0) {
        list = <StyledListMessage>{nothingAvailableText}</StyledListMessage>;
    } else if (availableMenuItems.length > 0) {
        list = (
            <VirtualScroll
                ref={listRef}
                rowHeight={listItemHeight}
                height={
                    Math.min(visibleItemsCount, availableMenuItems.length) *
                        listItemHeight +
                    LIST_ITEM_EDGE_PADDING * 2
                }
                width={width}
                renderListWrapper={renderListWrapper}
                renderData={availableMenuItems}
                renderRow={renderRow}
                handleScroll={setListScrollPosition}
                gapHeight={LIST_ITEM_EDGE_PADDING * 2}
            />
        );
    } else {
        list = <StyledListMessage>{noResultsFoundText}</StyledListMessage>;
    }

    return (
        <StyledList
            {...{
                openDirection,
                listItemHeight,
                'data-aid': TEST_AID.OPTIONS_LIST,
                className: 'virtual-options-list',
            }}
        >
            {list}
        </StyledList>
    );
};

export default memo(VirtualList);
