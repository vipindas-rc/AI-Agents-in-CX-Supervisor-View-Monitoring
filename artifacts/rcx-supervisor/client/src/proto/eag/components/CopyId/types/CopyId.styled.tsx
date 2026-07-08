import styled from 'styled-components';

export const CopyButtonLinkWrapper = styled.div`
    margin-top: -2px;
`;
export const CopyButtonLink = styled.a`
    line-height: 1;
    color: ${({ theme }) =>
        `var(--primary-text-color, ${theme.colors.primary}) !important`};

    &:hover {
        background-color: ${({ theme }) =>
            `var(--menu-item-hover, ${theme.colors.gray[200]}) !important`};
    }
`;
export const CopyButton = styled.div``;
