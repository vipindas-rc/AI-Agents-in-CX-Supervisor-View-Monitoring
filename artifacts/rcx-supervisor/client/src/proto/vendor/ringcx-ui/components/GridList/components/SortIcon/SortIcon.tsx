import type { FC } from 'react';

import {
    StyledArrowDown,
    StyledArrowUp,
    StyledSortIcon,
} from './SortIcon.styled';
import type { SortIconType } from './types';
import { TEST_AID } from '../../../../constants/index';
import { SortDirection } from '../../../../helpers/sorting';

const SortIcon: FC<SortIconType> = ({ direction, isSortable }) => (
    <StyledSortIcon
        {...{ direction, isSortable }}
        data-aid={TEST_AID.GRID_LIST.SORT_LABEL}
        aria-hidden='true'
    >
        <StyledArrowUp
            selected={isSortable && direction === SortDirection.ASC}
        />
        <StyledArrowDown
            selected={isSortable && direction === SortDirection.DESC}
        />
    </StyledSortIcon>
);

export default SortIcon;
