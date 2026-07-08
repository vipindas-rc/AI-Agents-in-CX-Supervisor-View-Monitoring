import { useState, useMemo, useEffect, useRef, useCallback } from 'react';

import type { VirtualListType } from './types';
import type { RenderRowsData } from '../../types';
import BasicList from '../BasicList';

type HeightMapEntry = {
    offset: number;
    height: number;
};

const VirtualList = <R,>({
    data,
    renderRow,
    rowBuffer,
    contentHeight,
    rowHeight,
    getRowHeight,
    openState,
    scrollPosition,
    classes,
    ariaRoleForRows,
    initialOffset = 0,
}: VirtualListType<R>): JSX.Element => {
    const height = useRef<number>(0);
    const offset = useRef<number>(initialOffset);
    const [renderData, setRenderData] = useState<RenderRowsData<R>>();

    const calculateRowHeight = useCallback(
        (row: R & { glId?: string }): number => {
            if (getRowHeight) {
                const isExpanded = openState?.[row.glId ?? ''] ?? false;
                return getRowHeight(row, isExpanded);
            }
            return rowHeight;
        },
        [getRowHeight, openState, rowHeight]
    );

    const heightMap = useMemo<HeightMapEntry[]>(() => {
        const map: HeightMapEntry[] = [];
        let currentOffset = 0;

        for (const row of data) {
            const rowH = calculateRowHeight(row);
            map.push({ offset: currentOffset, height: rowH });
            currentOffset += rowH;
        }

        return map;
    }, [data, calculateRowHeight]);

    const totalHeight = useMemo(() => {
        if (heightMap.length === 0) return 0;
        const lastEntry = heightMap[heightMap.length - 1];
        return lastEntry.offset + lastEntry.height;
    }, [heightMap]);

    const findFirstVisibleIndex = useCallback(
        (scrollPos: number): number => {
            if (heightMap.length === 0) return 0;

            let low = 0;
            let high = heightMap.length - 1;

            while (low < high) {
                const mid = Math.floor((low + high) / 2);
                if (
                    heightMap[mid].offset + heightMap[mid].height <=
                    scrollPos
                ) {
                    low = mid + 1;
                } else {
                    high = mid;
                }
            }

            return low;
        },
        [heightMap]
    );

    // Calculate visible rows based on scroll position and content height
    useEffect(() => {
        if (heightMap.length === 0) {
            setRenderData([]);
            height.current = 0;
            offset.current = 0;
            return;
        }

        const adjustedScrollPosition = Math.max(
            0,
            scrollPosition - initialOffset
        );
        const firstVisibleIndex = findFirstVisibleIndex(adjustedScrollPosition);
        const startIndex = Math.max(0, firstVisibleIndex - rowBuffer);

        let endIndex = firstVisibleIndex;
        let accumulatedHeight = 0;
        const targetHeight = contentHeight + rowBuffer * rowHeight;

        while (
            endIndex < heightMap.length &&
            accumulatedHeight < targetHeight
        ) {
            accumulatedHeight += heightMap[endIndex].height;
            endIndex++;
        }

        endIndex = Math.min(heightMap.length, endIndex + rowBuffer);

        const resultData = data.slice(startIndex, endIndex);

        height.current = totalHeight;
        offset.current = heightMap[startIndex]?.offset ?? 0;
        setRenderData(resultData);
    }, [
        data,
        heightMap,
        totalHeight,
        scrollPosition,
        contentHeight,
        rowBuffer,
        rowHeight,
        findFirstVisibleIndex,
        initialOffset,
    ]);

    return useMemo(
        () => (
            <div
                style={{
                    height: height.current + 'px',
                    paddingTop: offset.current + 'px',
                }}
                role='presentation'
            >
                {renderData && (
                    <BasicList<R>
                        {...{
                            data: renderData,
                            renderRow,
                            classes,
                            ariaRoleForRows,
                        }}
                    />
                )}
            </div>
        ),
        [classes, renderData, renderRow, ariaRoleForRows]
    );
};

export default VirtualList;
