import styled from 'styled-components';

export const StyledIconWrapper = styled.button`
    display: inline-flex;
    align-items: center;
    border: none;
    background-color: transparent;
    padding: 0;
`;

export const StyledIcon = styled.div`
    height: 16px;
    width: 16px;
    margin-left: 14px;
    color: ${({ theme }) => theme.colors.gray[600]};
`;
