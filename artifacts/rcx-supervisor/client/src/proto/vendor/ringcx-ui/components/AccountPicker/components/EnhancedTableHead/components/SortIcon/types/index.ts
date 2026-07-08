import type { Order } from '../../../../../constants';

export type ISortIcon = {
    order: Order;
    isSortEnabled: boolean;
};

export type IArrowIcon = {
    selected: boolean;
};
