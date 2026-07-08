import type {
    Classes,
    OnChangeOpenState,
    OpenState,
    RenderEmptyRow,
    RenderRow,
    RenderRowsGroupData,
    RenderSubRow,
} from '../../../types';

export type BasicListGroupType<R, S> = {
    data: RenderRowsGroupData<R, S>;
    openState: OpenState;
    onChangeOpenState: OnChangeOpenState;
    renderRow: RenderRow<R>;
    renderSubRow: RenderSubRow<S>;
    renderEmptyRow: RenderEmptyRow<R>;
    classes?: Classes;
    ariaRoleForRows?: string;
};
