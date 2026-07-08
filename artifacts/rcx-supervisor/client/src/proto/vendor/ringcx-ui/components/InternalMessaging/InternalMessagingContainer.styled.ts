import styled from 'styled-components';

export const StyledInternalMessagingContainer = styled.div`
    z-index: ${({ theme }) => theme.zIndexes.sideNav + 1};

    @media (max-width: 768px) {
        display: none;
    }

    .im__notifications-button {
        margin-left: 24px;
    }
`;
