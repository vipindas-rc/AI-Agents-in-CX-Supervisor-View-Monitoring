import styled from 'styled-components';

import { RESPONSIVE_BREAKPOINT } from '../../../../../constants/app';
import { ChatCard } from '../ChatCard';

export const StyledGroupCard = styled(ChatCard)`
    margin-bottom: 8px;
    width: auto;

    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        margin-bottom: 0;
        border-color: ${({ theme }) => theme.colors.gray[400]};
    }
`;
