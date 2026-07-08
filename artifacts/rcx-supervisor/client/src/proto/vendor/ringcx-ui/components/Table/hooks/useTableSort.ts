import { useCallback, useMemo, useState } from 'react';

import type { SortDirection } from '@material-ui/core/TableCell';

import type { ITableRow } from '../types';

const sortDirections: SortDirection[] = ['asc', 'desc', false];
export const useTableSort = (rows: ITableRow[]) => {
    const [order, setOrder] = useState<SortDirection>(false);
    const [orderBy, setOrderBy] = useState('');

    const onSort = useCallback(
        (fieldId: string) => {
            let newOrder: SortDirection = sortDirections[0];
            if (orderBy === fieldId) {
                newOrder =
                    sortDirections[(sortDirections.indexOf(order) + 1) % 3];
                if (newOrder === sortDirections[2]) {
                    setOrderBy('');
                }
            } else {
                setOrderBy(fieldId);
            }
            setOrder(newOrder);
        },
        [order, orderBy]
    );

    const sortedRows = useMemo(
        () =>
            order === sortDirections[2]
                ? rows
                : [...rows].sort((a, b) =>
                      comparePayload(a, b, order, orderBy)
                  ),
        [rows, order, orderBy]
    );

    return {
        order,
        orderBy,
        onSort,
        sortedRows,
    };
};

function comparePayload(
    a: ITableRow,
    b: ITableRow,
    newOrder: SortDirection,
    fieldId: string
) {
    let res = 1;
    if (newOrder === 'desc') {
        res = -res;
    }

    return a.payload[fieldId] > b.payload[fieldId] ? res : -res;
}
