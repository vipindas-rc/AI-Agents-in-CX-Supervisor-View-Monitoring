import type { UIEvent } from 'react';
import { memo, useMemo, useState, useCallback, forwardRef } from 'react';

import { DEFAULT_BUFFER_SIZE } from './constants';
import type { IVirtualScroll } from './types';
import { VirtualScrollStyled } from './VirtualScroll.styled';

const VirtualScroll = forwardRef<HTMLDivElement, IVirtualScroll>(
    (
        {
            width,
            height,
            renderListWrapper,
            renderRow,
            renderData,
            rowHeight,
            bufferSize = DEFAULT_BUFFER_SIZE,
            handleScroll,
            gapHeight = 0,
            ...others
        },
        ref
    ) => {
        const [scrollPosition, setScrollPosition] = useState<number>(0);

        const rowCount = useMemo(() => {
            const normalizedHeight = height - (height % rowHeight);
            return normalizedHeight / rowHeight + bufferSize * 2;
        }, [height, rowHeight, bufferSize]);

        const totalHeight = useMemo(
            () => renderData.length * rowHeight + gapHeight,
            [renderData, rowHeight, gapHeight]
        );

        // eslint-disable-next-line react-hooks/exhaustive-deps
        const onScroll = useCallback(
            (() => {
                let lastPosition = 0;
                return (e: UIEvent<HTMLDivElement>) => {
                    const { scrollTop } = e.currentTarget;
                    if (Math.abs(lastPosition - scrollTop) > rowHeight) {
                        lastPosition = scrollTop;
                        setScrollPosition(scrollTop);
                    }
                    handleScroll && handleScroll(scrollTop, e.currentTarget);
                };
            })(),
            []
        );

        const getRows = () => {
            const offset = Math.min(
                Math.floor(scrollPosition / rowHeight),
                Math.max(renderData.length - rowCount, 0)
            );

            const result = [];

            let startIndex = 0;
            let endIndex = renderData.length;

            if (renderData.length > rowCount) {
                const topOffset = offset - bufferSize;
                const bottomOffset = topOffset < 0 ? Math.abs(topOffset) : 0;

                startIndex = Math.max(topOffset, 0);
                endIndex = Math.min(
                    rowCount + offset + bottomOffset,
                    renderData.length
                );
            }
            for (let i = startIndex; i < endIndex; i++) {
                result.push(renderRow(renderData[i], i));
            }

            return result;
        };

        const getList = () => {
            const bufferHeight = bufferSize * rowHeight;
            const rowsHeight = rowCount * rowHeight;

            const delta = Math.max(scrollPosition - bufferHeight, 0);

            const compensationTop = Math.max(
                Math.min(
                    delta - (delta % rowHeight),
                    totalHeight - rowsHeight - bufferHeight
                ),
                0
            );

            const compensationBottom = Math.max(
                totalHeight - (rowsHeight + compensationTop + bufferHeight),
                0
            );

            return renderListWrapper(
                getRows,
                compensationTop,
                compensationBottom
            );
        };

        return (
            <VirtualScrollStyled
                tabIndex={-1}
                data-dc-allow-scroll=""
                ref={ref}
                width={width}
                height={height}
                onScroll={onScroll}
                {...others}
            >
                {getList()}
            </VirtualScrollStyled>
        );
    }
);

export default memo(VirtualScroll);
