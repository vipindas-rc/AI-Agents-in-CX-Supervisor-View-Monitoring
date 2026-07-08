import type {
    Classes,
    OnChangeOpenState,
    OpenState,
    RenderEmptyRow,
    RenderRow,
    RenderRowsGroupData,
    RenderSubRow,
} from '../../../types';

export type VirtualListGroupType<R, S> = {
    data: RenderRowsGroupData<R, S>;
    openState: OpenState;
    scrollPosition: number;
    contentHeight: number;
    rowHeight: number;
    rowBuffer: number;
    onChangeOpenState: OnChangeOpenState;
    renderRow: RenderRow<R>;
    renderSubRow: RenderSubRow<S>;
    renderEmptyRow: RenderEmptyRow<R>;
    classes?: Classes;
};
