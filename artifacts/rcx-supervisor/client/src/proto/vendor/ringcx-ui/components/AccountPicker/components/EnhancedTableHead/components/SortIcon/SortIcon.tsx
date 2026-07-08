import type { FC } from 'react';

import {
    StyledArrowDown,
    StyledArrowUp,
    StyledSortIcon,
} from './SortIcon.styled';
import type { ISortIcon } from './types';
import { Order } from '../../../../constants';

const SortIcon: FC<ISortIcon> = ({ order, isSortEnabled }) => {
    return (
        <StyledSortIcon {...{ order, isSortEnabled }}>
            <StyledArrowUp selected={order === Order.ASC} />
            <StyledArrowDown selected={order === Order.DESC} />
        </StyledSortIcon>
    );
};

export default SortIcon;
