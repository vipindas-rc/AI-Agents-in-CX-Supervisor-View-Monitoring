import type {
    Classes,
    GetRowHeight,
    OpenState,
    RenderRow,
    RenderRowsData,
} from '../../../types';

export type VirtualListType<R> = {
    data: RenderRowsData<R>;
    scrollPosition: number;
    rowBuffer: number;
    contentHeight: number;
    rowHeight: number;
    // Optional for dynamic height calculation
    getRowHeight?: GetRowHeight<R>;
    openState?: OpenState;
    renderRow: RenderRow<R>;
    classes?: Classes;
    ariaRoleForRows?: string;
    // Optional, need only for virtualization with custom scroll container
    initialOffset?: number;
};
