import styled from 'styled-components';

export const StyledSortIconWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 16px;
    width: 16px;
    color: ${({ theme }) => theme.colors.gray[700]};
    cursor: pointer;
`;
