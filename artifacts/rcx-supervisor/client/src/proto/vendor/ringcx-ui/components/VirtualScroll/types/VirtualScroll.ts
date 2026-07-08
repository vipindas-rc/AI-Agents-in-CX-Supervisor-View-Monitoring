import type { ReactNode, SyntheticEvent } from 'react';

export interface IVirtualScroll {
    width?: number;
    height: number;
    renderData: unknown[];
    rowHeight: number;
    bufferSize?: number;
    renderListWrapper(
        getRows: () => ReactNode[],
        compensationTop: number,
        compensationBottom: number
    ): ReactNode;
    renderRow(rowData: unknown, index: number): ReactNode;
    handleScroll?(offsetY: number, ele?: HTMLDivElement): void;
    gapHeight?: number;
}

export interface IVirtualScrollStyled {
    width?: number;
    height: number;
    onScroll(event: SyntheticEvent): void;
}
