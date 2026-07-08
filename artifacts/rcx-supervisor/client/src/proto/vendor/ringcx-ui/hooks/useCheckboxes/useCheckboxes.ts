import { useCallback, useEffect, useMemo, useState } from 'react';

import { createModuleClosure } from '@ringcx/shared';
import { get, isEqual, set } from 'lodash';

import type {
    BulkValue,
    GridEditData,
    CheckboxFiltration,
    ChildrenState,
    UseCheckboxes,
    MaxSelectionOptions,
} from './types';
import {
    checkboxFiltration,
    getBulkCheckboxProps,
    getCheckboxes,
    getCheckboxProps,
    getPathFromGlId,
} from '../../helpers/checkboxes';

const checkboxesCache: { value: Record<string, GridEditData<boolean>> } =
    createModuleClosure({});

export const clearCheckboxesCache = (cacheKeys: string[]) => {
    if (checkboxesCache.value) {
        for (const key of cacheKeys) {
            delete checkboxesCache.value[key];
        }
    }
};

export const useCheckboxes: UseCheckboxes = (data, init, cacheKey) => {
    const initialCheckboxes = useMemo(
        () => getCheckboxes(data, init),
        [data, init]
    );

    const [checkboxes, setCheckboxes] = useState<GridEditData<boolean>>({});

    const currentCache = cacheKey && checkboxesCache.value[cacheKey];

    const handleSetCheckboxes = useCallback(
        (value: GridEditData<boolean>) => {
            setCheckboxes(value);
            if (cacheKey) {
                checkboxesCache.value[cacheKey] = value;
            }
        },
        [cacheKey]
    );

    useEffect(() => {
        if (cacheKey && (!currentCache || !Object.keys(currentCache).length)) {
            checkboxesCache.value[cacheKey] = initialCheckboxes;
        }
    }, [currentCache, initialCheckboxes, cacheKey]);

    useEffect(() => {
        if (cacheKey) {
            setCheckboxes(currentCache || {});
        } else {
            setCheckboxes((prev) =>
                isEqual(prev, initialCheckboxes) ? prev : initialCheckboxes
            );
        }
    }, [cacheKey, currentCache, initialCheckboxes]);

    const handleCheckboxFiltration = useCallback<CheckboxFiltration>(
        (data, checkboxes, onlyChecked = false) => {
            const newCheckboxes = { ...checkboxes };

            return checkboxFiltration(data, newCheckboxes, onlyChecked);
        },
        []
    );

    const handleSetCheckbox = useCallback(
        (id: string, value: boolean | symbol, path?: string[]) => {
            const pathFromId = getPathFromGlId(id);
            const workingPath = path || pathFromId;

            setCheckboxes((prev) => {
                const newCheckboxes = set({ ...prev }, workingPath, value);
                if (cacheKey) {
                    checkboxesCache.value[cacheKey] = newCheckboxes;
                }
                return newCheckboxes;
            });
        },
        [cacheKey]
    );

    return useMemo(
        () => ({
            checkboxes,
            setCheckboxes: handleSetCheckboxes,
            setCheckbox: handleSetCheckbox,
            checkboxFiltration: handleCheckboxFiltration,
        }),
        [
            checkboxes,
            handleSetCheckboxes,
            handleSetCheckbox,
            handleCheckboxFiltration,
        ]
    );
};
export const useBulkCheckboxBase = (
    children: BulkValue<boolean>,
    onlyChecked = 0
) => {
    const [checked, setChecked] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [indeterminate, setIndeterminate] = useState(false);
    const [checkedCount, setCheckedCount] = useState(0);

    useEffect(() => {
        if (!children) {
            // Disable checkboxes for the only group that is empty
            setDisabled(true);
            return;
        }

        const checkedEntries = Object.entries(children).filter(
            ([, value]) => value === true
        );
        const values =
            onlyChecked && checkedEntries.length
                ? Object.fromEntries(checkedEntries)
                : children;

        const { checked, indeterminate, disabled } = getBulkCheckboxProps(
            values as ChildrenState<boolean>
        );

        setChecked(checked);
        setDisabled(disabled);
        setIndeterminate(indeterminate);
        setCheckedCount(checkedEntries.length);
    }, [children, onlyChecked]);

    return {
        checked,
        disabled,
        indeterminate,
        checkedCount,
    };
};

export const useBulkCheckbox = <T extends { glId: string }>(
    checkboxes: GridEditData<boolean> | ChildrenState<boolean>,
    setCheckboxes: (checkboxes: GridEditData<boolean>) => void,
    glId?: string,
    segmentIndex?: number,
    maxSelectionOptions?: MaxSelectionOptions<T>
) => {
    const children = useMemo(() => {
        return glId ? checkboxes[glId] : checkboxes;
    }, [checkboxes, glId]);

    const filteredSelectionState = useMemo(() => {
        if (!maxSelectionOptions) {
            return null;
        }

        const { filteredData, checkedCount, maxSelection, isMaxReached } =
            maxSelectionOptions;
        const filteredRows = (filteredData ?? []).filter(Boolean);

        const selectedFilteredCount = filteredRows.reduce((acc, row) => {
            return (
                acc + ((checkboxes as GridEditData<boolean>)[row.glId] ? 1 : 0)
            );
        }, 0);

        const isAllFilteredSelected =
            filteredRows.length > 0 &&
            selectedFilteredCount === filteredRows.length;
        const isMaxSelectionReached = checkedCount >= maxSelection;

        return {
            filteredRows,
            selectedFilteredCount,
            isAllFilteredSelected,
            isMaxSelectionReached,
            checkedCount,
            maxSelection,
            isMaxReached,
        };
    }, [maxSelectionOptions, checkboxes]);

    const onChange = useCallback(
        (value: boolean) => {
            if (filteredSelectionState && maxSelectionOptions) {
                const {
                    filteredRows,
                    checkedCount,
                    maxSelection,
                    selectedFilteredCount,
                } = filteredSelectionState;

                const deselectFilteredRows = () => {
                    if (filteredRows.length === 0) return;

                    const newCheckboxes = {
                        ...(checkboxes as GridEditData<boolean>),
                    };
                    let didChange = false;

                    for (const row of filteredRows) {
                        if (newCheckboxes[row.glId]) {
                            newCheckboxes[row.glId] = false;
                            didChange = true;
                        }
                    }

                    if (didChange) {
                        setCheckboxes(newCheckboxes);
                    }
                };

                if (!value) {
                    deselectFilteredRows();
                    return;
                }

                const availableSlots = maxSelection - checkedCount;
                if (availableSlots <= 0) {
                    // When max is reached and trying to check, deselect instead
                    if (selectedFilteredCount > 0) {
                        deselectFilteredRows();
                    }
                    return;
                }

                const rowsToSelect = filteredRows
                    .filter(
                        (row) =>
                            !(checkboxes as GridEditData<boolean>)[row.glId]
                    )
                    .slice(0, availableSlots);

                if (rowsToSelect.length === 0) return;

                const newCheckboxes = {
                    ...(checkboxes as GridEditData<boolean>),
                };
                for (const row of rowsToSelect) {
                    newCheckboxes[row.glId] = true;
                }

                setCheckboxes(newCheckboxes);
                return;
            }

            const result = Object.fromEntries(
                Object.keys(children).map((key) => [key, value])
            );

            if (glId) {
                setCheckboxes({
                    ...checkboxes,
                    [glId]: result,
                });
            } else {
                setCheckboxes({
                    ...result,
                });
            }
        },
        [
            checkboxes,
            children,
            glId,
            setCheckboxes,
            filteredSelectionState,
            maxSelectionOptions,
        ]
    );

    const baseCheckboxState = useBulkCheckboxBase(
        { ...(children as ChildrenState<boolean>) },
        segmentIndex
    );

    if (filteredSelectionState) {
        const {
            filteredRows,
            selectedFilteredCount,
            isAllFilteredSelected,
            isMaxReached,
            checkedCount,
        } = filteredSelectionState;

        const isBulkChecked = isAllFilteredSelected;
        const isBulkIndeterminate = !isBulkChecked && selectedFilteredCount > 0;
        const isBulkDisabled =
            filteredRows.length === 0 || (isMaxReached && checkedCount === 0);

        return {
            checked: isBulkChecked,
            disabled: isBulkDisabled,
            indeterminate: isBulkIndeterminate,
            checkedCount: selectedFilteredCount,
            onChange,
        };
    }

    const { checked, disabled, indeterminate, checkedCount } =
        baseCheckboxState;

    return {
        checked,
        disabled,
        indeterminate,
        checkedCount,
        onChange,
    };
};

export const useCheckbox = (
    checkboxes: GridEditData<boolean>,
    setCheckbox: (id: string, value: boolean | symbol) => void,
    glId: string
) => {
    const { checked, indeterminate } = getCheckboxProps(
        get(checkboxes, getPathFromGlId(glId))
    );

    const onChange = useCallback(
        (value: boolean) => {
            setCheckbox(glId, Boolean(value));
        },
        [glId, setCheckbox]
    );

    return {
        checked,
        indeterminate,
        onChange,
    };
};
