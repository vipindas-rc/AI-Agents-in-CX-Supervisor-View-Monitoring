import styled from 'styled-components';

export const WaitingOnUserNotification = styled.div`
    position: absolute;
    bottom: 12px;
    right: 12px;
    height: 12px;
    width: 12px;
    border-radius: 100%;
    background-color: ${({ theme }) => theme.colors.accent.orange};
`;
