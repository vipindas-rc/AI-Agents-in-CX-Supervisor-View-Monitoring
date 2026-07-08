import type { FC } from 'react';

import { Arrow } from '@ringcx/ui';

import { StyledSortIconWrapper } from './SortIcon.styled';

export const SortIcon: FC<{ direction: 'asc' | 'desc' | null }> = ({
    direction,
}) => {
    const arrowDirection: any = direction === 'asc' ? 'up' : 'down';
    return (
        <StyledSortIconWrapper>
            <Arrow direction={arrowDirection} />
        </StyledSortIconWrapper>
    );
};
