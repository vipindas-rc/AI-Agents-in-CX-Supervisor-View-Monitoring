import Badge from '@material-ui/core/Badge';
import styled from 'styled-components';

import type { IBadgeProps } from './types/Badge';
import { TEST_AID } from '../../constants';
import { UNUSED } from '../../helpers/usage';

export const StyledBadge = styled(
    ({ verticalCenter, ...restProps }: IBadgeProps) => {
        UNUSED(verticalCenter);
        return <Badge data-aid={TEST_AID.BADGE} {...restProps} />;
    }
)<IBadgeProps>`
    && > .MuiBadge-badge {
        font-size: 11px;
        min-width: 26px;
        height: 16px;
        padding: 1px 4px;
        background-color: ${({ theme }) => theme.colors.accent.orange};
        border: 1px solid ${({ theme }) => theme.colors.background};
        top: ${({ verticalCenter }) => verticalCenter && '50%'};
    }
`;
