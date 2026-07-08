import styled from 'styled-components';

import Badge from '../../../../../Badge';
import type { IBadgeProps } from '../../../../../Badge/types/Badge';

export const StyledBadge = styled(Badge)<IBadgeProps>`
    && {
        display: flex;

        & > .MuiBadge-badge {
            top: ${({ verticalCenter }) =>
                verticalCenter ? '-20px' : '-33px'};
            right: ${({ verticalCenter }) => (verticalCenter ? '21px' : '8px')};
            @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
                top: -21px;
                left: 6px;
                right: auto;
                font-size: 9px;
                min-width: 16px;
                height: 14px;
                padding: 1px 2px;
            }
        }
    }
`;
