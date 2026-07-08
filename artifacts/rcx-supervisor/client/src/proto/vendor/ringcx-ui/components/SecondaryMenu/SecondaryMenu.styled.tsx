import styled from 'styled-components';

import { getMenuItemStyles } from './components/MenuItemAccordion/mixins';

export const StyledLeftMenuContent = styled.div`
    width: 275px;
    padding: 18px 8px;
    height: 100%;
    border-right: 1px solid ${({ theme }) => theme.colors.gray[300]};
    background-color: ${({ theme }) => theme.colors.gray[50]};
    overflow-y: auto;
    box-sizing: border-box;

    a {
        ${getMenuItemStyles}
    }

    * {
        box-sizing: border-box;
    }
`;

export const StyledMenuHeader = styled.div`
    padding: 0 8px;
    color: ${({ theme }) => theme.colors.gray[900]};
    font-size: 16px;
    font-weight: normal;
    letter-spacing: 0.17px;
    line-height: 24px;
    margin-bottom: 14px;
`;

export const StyledDelimiter = styled.div`
    max-width: 100%;
    margin: 24px 0;
    padding: 0 8px;

    &:after {
        display: block;
        content: '';
        background-color: ${({ theme }) => theme.colors.gray[300]};
        width: 100%;
        height: 1px;
    }
`;
