import type { RenderRowsData } from '../../../components';

export interface IGridAble {
    glId: string;
    parentGlId?: string;
}

export interface IGridAbleItem extends IGridAble {
    id: number | string;
}

export interface IGridAbleGroupItem extends IGridAble, IGridAbleItem {
    groupId: number | string;
}

export interface IGridAbleGroup extends IGridAble {
    groupId: number | string;
    subRows: IGridAbleGroupItem[];
}

export type AssignmentData<T = unknown | undefined> = Record<
    string,
    T extends undefined
        ? boolean
        : T | Record<string, T extends undefined ? boolean : T>
>;

export type InitializationData<T> = Record<string, Set<T>>;

export type ChildrenState<T> = Record<string, T | symbol>;
// Used for row selection checkboxes by default
export type BulkValue<T> = ChildrenState<T> | T | symbol;
export type GridEditData<T> = Record<string, BulkValue<T>>;

/**
 * A - row entity type
 * B - subrow entity type
 */
export type UseCheckboxesReturnType<A, B = undefined> = {
    checkboxes: GridEditData<boolean>;
    setCheckboxes: (value: GridEditData<boolean>) => void;
    setCheckbox: (id: string, value: boolean | symbol, path?: string[]) => void;
    checkboxFiltration: (
        data: RenderRowsData<A, B>,
        checkboxes: GridEditData<boolean>,
        onlyChecked?: boolean
    ) => RenderRowsData<A, B>;
};

// Used for row selection checkboxes
export type UseCheckboxes = <
    A extends IGridAbleGroup | IGridAbleItem,
    B extends IGridAbleItem | undefined,
>(
    data: RenderRowsData<A, B>,
    init?: InitializationData<boolean>,
    cacheKey?: string
) => UseCheckboxesReturnType<A, B>;

export type SimpleObjectMap<T> = Record<string, T[keyof T]>;

export type CheckboxFiltration = <
    A extends IGridAbleGroup | IGridAbleItem,
    B extends IGridAbleItem | undefined,
>(
    data: RenderRowsData<A, B>,
    checkboxes: GridEditData<boolean>,
    onlyChecked?: boolean
) => RenderRowsData<A, B>;

/**
 * T - Basic entity type to use in GridList
 * K - Additional properties useful for sorting or filtration
 */
export type GridAble<
    T,
    K extends Record<string, unknown> = NonNullable<unknown>,
> = T &
    K &
    (T extends IGridAbleGroup
        ? IGridAbleGroup
        : T extends IGridAbleGroupItem
          ? IGridAbleGroupItem
          : IGridAbleItem);

export type Checkboxes = {
    checkboxes: GridEditData<boolean>;
};

/**
 * Used for row selection checkboxes
 *
 * T - row entity type
 */
export type CheckableRowProps<T> = T &
    IGridAble &
    Checkboxes & {
        setCheckboxes: (data: GridEditData<boolean>) => void;
    };

/**
 * Used for row selection checkboxes
 *
 * T - sub-row entity type
 */
export type CheckableSubRowProps<T> = T &
    IGridAble &
    Checkboxes & {
        setCheckbox: (id: string, value: boolean | symbol) => void;
    };

export type MaxSelectionOptions<T extends { glId: string } = { glId: string }> =
    {
        maxSelection: number;
        filteredData?: T[];
        checkedCount: number;
        isMaxReached: boolean;
        dataVersion?: number;
    };
