import { css } from 'styled-components';

import { textOverflowStyles } from '../../../../TextOverflow/TextOverflow';

export const getMenuItemStyles = css`
    ${textOverflowStyles};
    width: 100%;
    cursor: pointer;
    margin-bottom: 2px;
    font-size: 14px;
    font-weight: normal;
    color: ${({ theme }) => theme.colors.gray[900]};
    letter-spacing: 0.25px;
    line-height: 29px;
    border-radius: 15px;
    height: 30px;
    padding: 0 8px;
    text-decoration: none;

    &:hover {
        background-color: ${({ theme }) => theme.colors.gray[100]};
    }
`;

export const getActiveLinkStyled = css`
    background-color: ${({ theme }) => theme.colors.gray[200]};
    font-weight: 500;
    letter-spacing: 0.15px;

    &:hover {
        background-color: ${({ theme }) => theme.colors.gray[200]};
    }
`;
