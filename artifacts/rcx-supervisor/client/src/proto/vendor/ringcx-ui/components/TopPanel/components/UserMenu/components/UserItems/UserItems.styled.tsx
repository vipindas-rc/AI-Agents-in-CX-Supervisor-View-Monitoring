import styled, { css } from 'styled-components';

export const StyledUserMenu = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0;
    min-width: 200px;
`;

export const StyledUserMenuItem = styled.li`
    ${({ theme: { colors } }) => css`
        a,
        button {
            cursor: pointer;
            padding: 12px 16px;
            letter-spacing: 0.15px;
            display: block;
            font-family: inherit;
            font-size: 14px;
            font-weight: 500;
            width: 100%;
            border: none;
            text-align: left;
            outline: none;
            text-decoration: none;
            transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
            background-color: ${colors.background};
            color: ${colors.gray[850]};

            &:hover,
            &:active {
                background-color: ${colors.gray[200]};
            }
            &:focus-visible {
                background-color: ${colors.gray[200]};
            }
        }
    `}
`;
