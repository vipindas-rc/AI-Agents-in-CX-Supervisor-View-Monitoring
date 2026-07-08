import type { RenderRow, RenderRowsData, Classes } from '../../../types';

export type BasicListType<R> = {
    data: RenderRowsData<R>;
    renderRow: RenderRow<R>;
    classes?: Classes;
    ariaRoleForRows?: string;
};
