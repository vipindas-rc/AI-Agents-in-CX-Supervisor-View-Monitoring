import styled from 'styled-components';

export const LinkStyled = styled.a`
    margin: 0;
    color: ${({ theme }) => theme.colors.primary};
    text-decoration: none;
    font-weight: 500;

    &:hover {
        text-decoration: underline;
    }
`;
