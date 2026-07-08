import type { Dispatch, SetStateAction } from 'react';
import { useCallback } from 'react';

import type { ValueNormalizer } from '../../../helpers/sortHelpers.deprecated';
import { Order } from '../constants';
import type { IAccount, IColumn, OrderBy } from '../types';

const NORMALIZERS_MAP = {
    number: (value: unknown) => Number(value),
    string: (value: unknown) => String(value).toLowerCase(),
};

export const useTableSort = (
    order: Order,
    setOrder: Dispatch<SetStateAction<Order>>,
    orderBy: OrderBy,
    setOrderBy: Dispatch<SetStateAction<OrderBy>>,
    setSortValueNormalizer?: (sorter: () => ValueNormalizer<IAccount>) => void
) => {
    return useCallback(
        (property: keyof IAccount, sortAs: IColumn['sortAs'] = 'string') => {
            let newOrder: Order = Order.NONE;
            if (orderBy === property) {
                if (order === Order.NONE) {
                    newOrder = Order.ASC;
                }
                if (order === Order.ASC) {
                    newOrder = Order.DESC;
                }
            } else {
                newOrder = Order.ASC;
            }

            setOrder(newOrder);
            setOrderBy(property);
            setSortValueNormalizer &&
                setSortValueNormalizer(() => NORMALIZERS_MAP[sortAs]);
        },
        [order, orderBy, setOrder, setOrderBy, setSortValueNormalizer]
    );
};
