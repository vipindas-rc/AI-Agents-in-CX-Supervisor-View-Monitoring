import styled from 'styled-components';

export const InfoBarActionButtonStyled = styled.a`
    color: ${({ theme }) => theme.colors.primary};
    padding: 0 6px;
    cursor: pointer;
    font-weight: 500;
    line-height: 16px;
    text-decoration: none;

    &:hover {
        text-decoration: underline;
    }
`;
