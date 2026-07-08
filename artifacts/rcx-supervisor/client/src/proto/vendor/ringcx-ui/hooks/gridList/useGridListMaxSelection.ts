import { useCallback, useLayoutEffect, useRef, useState } from 'react';

import type { RenderRowsData } from '../../components';
import type { MaxSelectionOptions } from '../useCheckboxes';

const DEFAULT_MAX_SELECTION = 100;

export type UseGridListMaxSelectionOptions<T extends { glId: string }> = {
    checkedCount: number;
    maxSelection?: number;
    onMaxSelectionPropsChange?: (props: MaxSelectionOptions) => void;
    initialData?: RenderRowsData<T>;
};

//Hook for managing GridList filtered data with max selection limits
export const useGridListMaxSelection = <T extends { glId: string }>({
    checkedCount,
    maxSelection = DEFAULT_MAX_SELECTION,
    onMaxSelectionPropsChange,
    initialData,
}: UseGridListMaxSelectionOptions<T>): ((
    filteredData: RenderRowsData<T>
) => void) => {
    const gridListFilteredDataRef = useRef<RenderRowsData<T>>(
        initialData ?? []
    );
    const [gridListDataVersion, setGridListDataVersion] = useState(0);

    const onMaxSelectionPropsChangeRef = useRef(onMaxSelectionPropsChange);
    onMaxSelectionPropsChangeRef.current = onMaxSelectionPropsChange;

    const isMaxReached = checkedCount >= maxSelection;

    const handleFilteredDataChange = useCallback(
        (filteredData: RenderRowsData<T>) => {
            gridListFilteredDataRef.current = filteredData;
            setGridListDataVersion((prev) => prev + 1);
        },
        []
    );

    useLayoutEffect(() => {
        onMaxSelectionPropsChangeRef.current?.({
            maxSelection,
            filteredData: gridListFilteredDataRef.current,
            checkedCount,
            isMaxReached,
            dataVersion: gridListDataVersion,
        });
    }, [gridListDataVersion, checkedCount, isMaxReached, maxSelection]);

    return handleFilteredDataChange;
};
