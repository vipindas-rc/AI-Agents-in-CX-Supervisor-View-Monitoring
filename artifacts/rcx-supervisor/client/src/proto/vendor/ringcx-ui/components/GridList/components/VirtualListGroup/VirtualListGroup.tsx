import { useEffect, useMemo, useRef, useState } from 'react';

import type { VirtualListGroupType } from './types';
import type { OpenState, RenderRowsGroupData } from '../../types';
import BasicListGroup from '../BasicListGroup';

const VirtualListGroup = <R, S>({
    data,
    openState,
    scrollPosition,
    contentHeight,
    rowHeight,
    rowBuffer,
    onChangeOpenState,
    renderRow,
    renderSubRow,
    renderEmptyRow,
    classes,
}: VirtualListGroupType<R, S>): JSX.Element => {
    const height = useRef<number>(0);
    const offset = useRef<number>(0);
    const innerOpenState = useRef<OpenState>();

    const [renderData, setRenderData] = useState<RenderRowsGroupData<R, S>>();

    //  TODO in next iteration need rewrite all this logic for use height + height map instead row count
    const rowCount = useMemo(
        () =>
            data.reduce<number>((accum, { glId, subRows }) => {
                if (subRows && openState[glId]) {
                    if (!subRows.length) {
                        return accum + 1;
                    }

                    return accum + subRows.length;
                }

                return accum;
            }, data.length),
        [data, openState]
    );

    const renderRowCount = useMemo(
        () =>
            Math.min(
                Math.floor(contentHeight / rowHeight) +
                    (contentHeight % rowHeight ? 1 : 0) +
                    rowBuffer * 2,
                rowCount
            ),
        [rowBuffer, contentHeight, rowCount, rowHeight]
    );

    const topOffsetCount = useMemo(
        () => Math.max(Math.floor(scrollPosition / rowHeight) - rowBuffer, 0),
        [scrollPosition, rowHeight, rowBuffer]
    );

    useEffect(() => {
        let counter = 0;
        const resultData = [];
        const countedRows = topOffsetCount + renderRowCount;

        for (let index = 0; index < data.length; index++) {
            const row = data[index];
            const { glId, subRows } = row;
            const isOpen = subRows && openState[glId];

            counter = counter + 1;

            if (
                (counter <= countedRows && counter > topOffsetCount) ||
                (counter <= topOffsetCount &&
                    (isOpen ? subRows.length || 1 : 0) + counter >
                        topOffsetCount)
            ) {
                resultData.push({
                    ...row,
                    isHidden: counter <= topOffsetCount,
                    ...(isOpen && {
                        subRows: [
                            ...subRows.filter(() => {
                                counter = counter + 1;

                                return (
                                    counter > topOffsetCount &&
                                    counter <= countedRows
                                );
                            }),
                        ],
                    }),
                });

                if (isOpen && !subRows.length) {
                    counter = counter + 1;
                }
            } else {
                if (isOpen) {
                    if (!subRows.length) {
                        counter = counter + 1;
                    } else {
                        counter = counter + subRows.length;
                    }
                }
            }
        }

        innerOpenState.current = openState;
        height.current = rowCount * rowHeight;
        offset.current = topOffsetCount * rowHeight;
        setRenderData(resultData);
    }, [data, openState, renderRowCount, rowCount, rowHeight, topOffsetCount]);

    return useMemo(
        () => (
            <div
                style={{
                    height: height.current,
                    paddingTop: offset.current,
                }}
            >
                {renderData && innerOpenState.current && (
                    <BasicListGroup<R, S>
                        {...{
                            data: renderData,
                            openState: innerOpenState.current,
                            onChangeOpenState,
                            renderRow,
                            renderSubRow,
                            renderEmptyRow,
                            classes,
                        }}
                    />
                )}
            </div>
        ),
        [
            renderData,
            onChangeOpenState,
            renderRow,
            renderSubRow,
            renderEmptyRow,
            classes,
        ]
    );
};

export default VirtualListGroup;
