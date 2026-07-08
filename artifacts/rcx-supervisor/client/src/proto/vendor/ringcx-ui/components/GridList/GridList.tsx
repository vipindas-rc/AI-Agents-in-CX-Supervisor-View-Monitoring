import type { UIEvent } from 'react';
import {
    useCallback,
    useMemo,
    useState,
    useRef,
    useEffect,
    useLayoutEffect,
} from 'react';

import BasicList from './components/BasicList';
import BasicListGroup from './components/BasicListGroup';
import GridListHead from './components/GridListHead';
import VirtualList from './components/VirtualList';
import VirtualListGroup from './components/VirtualListGroup';
import { GL_CLASSES } from './constants';
import { Wrapper, SpinnerWrapper } from './GridList.styled';
import type {
    GridListType,
    RenderRowsData,
    RenderRowsGroupData,
    RenderRowsOneRowData,
} from './types';
import {
    checkDisableSort,
    getRowsCount,
    getScrollTop,
    getScrollTarget,
    scrollTo,
    calculateListOffset,
    createResizeObserver,
} from '../../helpers/gridList';
import {
    useIsGroupedList,
    useOpenState,
    useSorting,
    useFiltration,
} from '../../hooks/gridList';
import Spinner from '../Spinner';

const GridList = <R, S = undefined>(props: GridListType<R, S>) => {
    const {
        listAriaLabel = '',
        header,
        columns,
        data,
        loading,
        renderRow,
        renderEmptyFilterResult,
        renderEmptyDataResult,
        className,
        filtrationCallback,
        initialOpenState,
        initialSortState,
        onChangeOpen,
        onChangeSort,
        onFilteredDataChange,
        useDynamicHeight = false,
        rowHeight = 40,
        getRowHeight,
        rowBuffer = 5,
        virtualListBorder = 10000,
        isDisableSort = false,
        isScrollDisabled = false,
        hideNoneSortDirection = false,
        classes = {},
        renderSortIcon,
        ariaRoleForRows = 'row',
        scrollContainerElement,
        scrollToRowId,
        screenReaderHelper,
    } = props;
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [preparedData, setPreparedData] =
        useState<RenderRowsData<R, S>>(data);
    const [contentHeight, setContentHeight] = useState<number>(0);
    const listOffsetTop = useRef<number>(0);
    const lastPosition = useRef<number>(0);
    const [minRowHeight, setMinHeight] = useState<number>(rowHeight);
    const [scrollPosition, setScrollPosition] = useState<number>(0);
    const [isPreparingReady, setPreparingReady] = useState<boolean>(false);
    const [isSortingReady, setSortingReady] = useState<boolean>(false);
    const [isFiltrationReady, setFiltrationReady] = useState<boolean>(false);
    const prevDataRef = useRef<RenderRowsData<R, S>>(data);
    const isReady =
        !loading && isSortingReady && isFiltrationReady && isPreparingReady;
    const dataRowsCount = useMemo(() => getRowsCount(data), [data]);
    const isVirtualList = dataRowsCount > virtualListBorder;
    const onScroll = useCallback(
        (event: UIEvent<HTMLDivElement>) => {
            const { scrollTop } = event.currentTarget;

            if (Math.abs(lastPosition.current - scrollTop) > minRowHeight) {
                lastPosition.current = scrollTop;
                setScrollPosition(scrollTop);
            }
        },
        [minRowHeight]
    );
    const isGroupedList = useIsGroupedList<R, S>(data);
    const [openState, setOverrideOpenState, onChangeOpenState] = useOpenState(
        initialOpenState,
        onChangeOpen
    );
    const emptyDataRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const isDataChanged = prevDataRef.current !== data;
        prevDataRef.current = data;

        // We will show spinner after change data only if this is virtual list with dynamic height,
        // because it is expensive operation to recreate high map, for other cases render should be faster and better avoid flashing spinner
        if (isVirtualList && useDynamicHeight && isDataChanged) {
            setPreparingReady(false);
            setSortingReady(false);
            setFiltrationReady(false);
        }

        if (isVirtualList) {
            setMinHeight(rowHeight);
        }
        setPreparedData(data);
        setPreparingReady(true);
    }, [data, rowHeight, isVirtualList, useDynamicHeight]);

    const [sortedData, sortState, onChangeSortState] = useSorting(
        preparedData,
        columns,
        setSortingReady,
        initialSortState,
        onChangeSort,
        hideNoneSortDirection
    );
    const filteredData = useFiltration(
        sortedData,
        setOverrideOpenState,
        setFiltrationReady,
        filtrationCallback
    );

    useLayoutEffect(() => {
        if (onFilteredDataChange && isFiltrationReady) {
            onFilteredDataChange(filteredData);
        }
    }, [filteredData, onFilteredDataChange, isFiltrationReady]);

    useEffect(() => {
        if (!isVirtualList) {
            return;
        }

        const scrollContainer = scrollContainerElement || wrapperRef.current;
        if (!scrollContainer) {
            return;
        }

        const currentScrollTop = getScrollTop(scrollContainer);
        const maxValidScroll = Math.max(0, filteredData.length * rowHeight);

        if (currentScrollTop >= maxValidScroll && maxValidScroll > 0) {
            scrollTo(scrollContainer, 0);
            setScrollPosition(0);
            lastPosition.current = 0;
        }
    }, [filteredData.length, isVirtualList, scrollContainerElement, rowHeight]);

    const renderRowsCount = useMemo<number>(
        () => getRowsCount<R, S>(filteredData),
        [filteredData]
    );

    useLayoutEffect(() => {
        const targetElement = scrollContainerElement || wrapperRef.current;

        if (!isVirtualList || !targetElement) {
            return;
        }

        if (scrollContainerElement && wrapperRef.current) {
            listOffsetTop.current = calculateListOffset(
                wrapperRef.current,
                scrollContainerElement
            );
        } else {
            listOffsetTop.current = 0;
        }

        setScrollPosition(0);
        lastPosition.current = 0;

        setContentHeight(targetElement.clientHeight);
        const { cleanup } = createResizeObserver(targetElement, () =>
            setContentHeight(targetElement.clientHeight)
        );

        return cleanup;
    }, [isVirtualList, scrollContainerElement]);

    useEffect(() => {
        if (!scrollContainerElement || !isVirtualList) {
            return;
        }

        const scrollTarget = getScrollTarget(scrollContainerElement);

        const handleScroll = () => {
            const scrollTop = getScrollTop(scrollContainerElement);

            if (Math.abs(lastPosition.current - scrollTop) > minRowHeight) {
                lastPosition.current = scrollTop;
                setScrollPosition(scrollTop);
            }
        };

        const initialScrollTop = getScrollTop(scrollContainerElement);
        lastPosition.current = initialScrollTop;
        setScrollPosition(initialScrollTop);

        scrollTarget.addEventListener('scroll', handleScroll);

        return () => {
            scrollTarget.removeEventListener('scroll', handleScroll);
        };
    }, [scrollContainerElement, isVirtualList, minRowHeight]);

    useEffect(() => {
        if (scrollToRowId === undefined) {
            return;
        }

        const scrollContainer = scrollContainerElement || wrapperRef.current;
        if (!scrollContainer) {
            return;
        }

        if (scrollToRowId === '') {
            scrollTo(scrollContainer, 0);
            if (isVirtualList) {
                setScrollPosition(0);
                lastPosition.current = 0;
            }
            return;
        }

        const rowIndex = filteredData.findIndex(
            (item) => item.glId === scrollToRowId
        );
        if (rowIndex < 0) {
            return;
        }

        const targetScrollTop = scrollContainerElement
            ? listOffsetTop.current + rowIndex * rowHeight
            : rowIndex * rowHeight;

        scrollTo(scrollContainer, targetScrollTop);
    }, [
        scrollToRowId,
        rowHeight,
        filteredData,
        scrollContainerElement,
        isVirtualList,
    ]);

    useEffect(() => {
        if (!!data.length && !filteredData.length) {
            const emptyElem =
                emptyDataRef.current?.querySelector(':scope > div');
            if (emptyElem) {
                screenReaderHelper &&
                    screenReaderHelper(emptyElem.textContent || '');
            }
        }
    }, [data.length, filteredData.length, renderEmptyFilterResult]);

    const renderList = () => {
        if (renderRowsCount > virtualListBorder) {
            return isGroupedList ? (
                <VirtualListGroup<R, S>
                    {...{
                        data: filteredData as RenderRowsGroupData<R, S>,
                        openState,
                        scrollPosition,
                        rowHeight,
                        rowBuffer,
                        contentHeight,
                        onChangeOpenState,
                        renderRow,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        renderSubRow: props.renderSubRow,
                        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                        // @ts-ignore
                        renderEmptyRow: props.renderEmptyRow,
                        classes,
                        ariaRoleForRows,
                    }}
                />
            ) : (
                <VirtualList<R>
                    {...{
                        data: filteredData as RenderRowsOneRowData<R>,
                        scrollPosition,
                        rowHeight,
                        getRowHeight,
                        openState,
                        rowBuffer,
                        contentHeight,
                        renderRow,
                        classes,
                        ariaRoleForRows,
                        initialOffset: scrollContainerElement
                            ? listOffsetTop.current
                            : 0,
                    }}
                />
            );
        }

        return isGroupedList ? (
            <BasicListGroup<R, S>
                {...{
                    data: filteredData as RenderRowsGroupData<R, S>,
                    openState,
                    onChangeOpenState,
                    renderRow,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    renderSubRow: props.renderSubRow,
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    renderEmptyRow: props.renderEmptyRow,
                    classes,
                    ariaRoleForRows,
                }}
            />
        ) : (
            <BasicList<R>
                {...{
                    data: filteredData as RenderRowsOneRowData<R>,
                    renderRow,
                    classes,
                    ariaRoleForRows,
                }}
            />
        );
    };

    return (
        <Wrapper
            {...{
                className,
                rowHeight,
                useDynamicHeight,
                isScrollDisabled,
                onScroll:
                    isVirtualList && !scrollContainerElement
                        ? onScroll
                        : undefined,
                ref: wrapperRef,
                role: 'grid',
                'aria-label': listAriaLabel,
            }}
        >
            <GridListHead<R, S>
                {...{
                    header,
                    isGroupedList,
                    columns,
                    onChangeSortState,
                    sortState,
                    isDisableSort:
                        checkDisableSort(filteredData) || isDisableSort,
                    classes,
                    renderSortIcon,
                    role: 'row',
                }}
            />
            <div className={GL_CLASSES.LIST} role='presentation'>
                {renderEmptyFilterResult &&
                    !!data.length &&
                    !filteredData.length && (
                        <div ref={emptyDataRef}>
                            {renderEmptyFilterResult()}
                        </div>
                    )}
                {renderEmptyDataResult &&
                    !data.length &&
                    renderEmptyDataResult()}
                {renderList()}
            </div>
            <div className={GL_CLASSES.FOOTER} />
            {!isReady && (
                <SpinnerWrapper>
                    <Spinner />
                </SpinnerWrapper>
            )}
        </Wrapper>
    );
};

export default GridList;
