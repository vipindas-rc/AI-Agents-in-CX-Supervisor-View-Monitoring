import styled from 'styled-components';

export const LogoutMenu = styled.button`
    &&&& {
        color: ${({ theme }) => theme.colors.primary};
        border: none;
        background-color: transparent;
        &:active,
        &:hover {
            background-color: ${({ theme }) => theme.colors.gray[0]};
        }
        &:disabled {
            color: ${({ theme }) => theme.colors.gray[500]};
        }
        &:disabled:hover {
            background-color: transparent;
        }
    }
`;
