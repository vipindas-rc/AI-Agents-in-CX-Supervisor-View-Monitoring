import { CircleWarning } from '@ringcx/ui';
import styled from 'styled-components';

export const NotificationIcon = styled(CircleWarning)`
    color: ${({ theme }) => theme.colors.accent.orange};
`;
