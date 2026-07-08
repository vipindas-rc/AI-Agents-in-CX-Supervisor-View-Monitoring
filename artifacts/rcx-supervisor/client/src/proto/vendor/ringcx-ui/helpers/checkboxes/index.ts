import { get, has } from 'lodash';

import type { RenderRowData, RenderRowsData } from '../../components';
import { INDETERMINATE_FIELD_VALUE } from '../../constants';
import type {
    AssignmentData,
    BulkValue,
    ChildrenState,
    IGridAbleGroup,
    IGridAbleItem,
    InitializationData,
    GridEditData,
} from '../../hooks';
import { getIsGroupedList } from '../gridList';

type CheckboxValue = boolean | typeof INDETERMINATE_FIELD_VALUE;

export function getPathFromGlId(id: string) {
    const splitId = id.split('-');
    return splitId.reduce((acc: string[], item, index) => {
        if (index === 0) {
            acc.push(item);
        } else {
            acc.push(`${acc[index - 1]}-${item}`);
        }

        return acc;
    }, []);
}

/**
 * A - row entity type
 * B - subrow entity type
 */
export function getInitialCheckboxes<
    A extends IGridAbleGroup | IGridAbleItem,
    B extends IGridAbleItem | undefined,
>(
    data: RenderRowsData<A, B>,
    assignmentsArray: AssignmentData[],
    searchPath: string[] = []
): Record<string, Set<boolean>> {
    const isTwoLevel = getIsGroupedList(data);

    return data.reduce((acc, row): InitializationData<boolean> => {
        const current = isTwoLevel
            ? getInitialCheckboxes(
                  (row as IGridAbleGroup).subRows,
                  assignmentsArray,
                  [(row as IGridAbleGroup).groupId.toString()]
              )
            : getInitialCheckbox<IGridAbleItem>(
                  row as IGridAbleItem,
                  assignmentsArray as AssignmentData<IGridAbleItem>[],
                  searchPath
              );

        acc = { ...acc, ...current };

        return acc;
    }, {});
}

export function getInitialCheckbox<T extends IGridAbleItem>(
    row: T,
    assignmentsArray: AssignmentData[],
    searchPath: string[]
): Record<string, Set<boolean>> {
    const { glId } = row;

    const workingPath = [...searchPath, row.id.toString()];

    const res: Record<string, Set<boolean>> = {};

    assignmentsArray.forEach((assignment) => {
        const isPresent = has(assignment, workingPath);

        if (res[glId]) {
            res[glId].add(isPresent);
        } else {
            res[glId] = new Set([isPresent]);
        }
    });

    return res;
}

/**
 * A - row entity type
 * B - subrow entity type
 */
export function getCheckboxes<
    A extends IGridAbleGroup | IGridAbleItem,
    B extends IGridAbleItem | undefined = undefined,
>(
    data: RenderRowsData<A, B>,
    init?: InitializationData<boolean>
): GridEditData<boolean> {
    const isTwoLevel = getIsGroupedList(data);

    return data.reduce(
        (acc: GridEditData<boolean>, row): GridEditData<boolean> => {
            const { glId } = row;

            acc[glId] = isTwoLevel
                ? (getCheckboxes(
                      (row as IGridAbleGroup).subRows,
                      init
                  ) as BulkValue<boolean>)
                : getCheckbox(row, init);

            return acc;
        },
        {}
    );
}

export function getCheckbox<T extends IGridAbleGroup | IGridAbleItem>(
    row: T,
    init?: InitializationData<boolean>
): CheckboxValue {
    const { glId } = row;

    if (!init || !Object.keys(init).length) {
        return false;
    }

    return Object.hasOwn(init, glId) && init[glId].size > 1
        ? INDETERMINATE_FIELD_VALUE
        : (init[glId].values().next().value ?? false);
}

export function filterCheckboxes<
    A extends IGridAbleGroup | IGridAbleItem,
    B extends IGridAbleItem | undefined,
>(data: RenderRowsData<A, B>, checkboxes: GridEditData<boolean>) {
    const isTwoLevel = getIsGroupedList(data);

    return data.reduce((acc: RenderRowsData<A, B>, row) => {
        if (isTwoLevel) {
            const subRows = filterCheckboxes(
                (row as IGridAbleGroup).subRows,
                checkboxes
            );
            const current = { ...row, subRows };
            subRows.length &&
                acc.push(current as unknown as RenderRowData<A, B>);
        } else {
            const current = filterCheckbox(row as IGridAbleItem, checkboxes);
            current && acc.push(current as unknown as RenderRowData<A, B>);
        }

        return acc;
    }, []);
}

function filterCheckbox<T extends IGridAbleItem>(
    row: T,
    checkboxes: GridEditData<boolean>
) {
    const { glId } = row;
    const path = getPathFromGlId(glId);

    const isPresent = has(checkboxes, path) && get(checkboxes, path);

    if (isPresent) {
        return {
            ...row,
        };
    }
}

export function checkboxFiltration<
    A extends IGridAbleGroup | IGridAbleItem,
    B extends IGridAbleItem | undefined,
>(
    data: RenderRowsData<A, B>,
    checkboxes: GridEditData<boolean>,
    onlyChecked = false
) {
    return onlyChecked ? filterCheckboxes(data, checkboxes) : data;
}

export function getBulkCheckboxProps(children: ChildrenState<boolean>) {
    const onlyValues = Object.values(children) as CheckboxValue[];
    const valuesSet = new Set<CheckboxValue>(onlyValues);

    const currentValue =
        valuesSet.size === 1
            ? (valuesSet.values().next().value ?? false)
            : valuesSet.size
              ? INDETERMINATE_FIELD_VALUE
              : false;

    return {
        ...getCheckboxProps(currentValue),
        disabled: valuesSet.size === 0,
    };
}

export function getCheckboxProps(value: CheckboxValue) {
    return {
        checked: value === INDETERMINATE_FIELD_VALUE ? false : !!value,
        indeterminate: value === INDETERMINATE_FIELD_VALUE,
    };
}
