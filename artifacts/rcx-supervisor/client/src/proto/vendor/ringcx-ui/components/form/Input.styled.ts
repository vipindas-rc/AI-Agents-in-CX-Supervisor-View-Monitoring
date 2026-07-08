import type { InputBaseProps } from '@mui/material';
import {
    InputAdornment as InputAdornmentUI,
    InputBase as InputBaseUI,
} from '@mui/material';
import { css, styled } from 'styled-components';

export const Input = styled(InputBaseUI)<InputBaseProps>`
    font-family: ${({ theme }) => theme.font.family};
    font-size: 14px;
    padding: 0;
    letter-spacing: 0.25px;
    border: 1px solid
        ${({ theme }) => {
            return theme.colors.gray[300];
        }};

    background-color: ${({ theme }) => {
        return theme.colors.background;
    }};

    border-radius: ${({ theme }) => {
        return theme.border.radius;
    }};

    &:hover {
        border-color: ${({ theme }) => {
            return theme.colors.gray[700];
        }};
    }

    &:focus-within {
        border-color: ${({ theme }) => {
            return theme.colors.primary;
        }};
    }

    > input:autofill {
        box-shadow: ${({ theme }) =>
            `inset 0 0 0 1000px ${theme.colors.background} !important`};
    }

    &.Mui-disabled {
        cursor: not-allowed;

        > input {
            cursor: not-allowed;
        }
    }

    input {
        padding: 4px 12px 5px;
    }

    ${({ disabled, theme }) =>
        disabled &&
        css`
            background-color: ${theme.colors.gray[50]};
            color: ${theme.colors.gray[700]};
            border: none;
        `}

    ${({ error, theme }) =>
        error &&
        css`
            border-color: ${theme.colors.accent.firetruck};

            &:hover {
                border-color: ${theme.colors.accent.firetruck};
            }
        `}
`;

export const InputWrapper = styled('div')`
    display: flex;
    align-items: center;

    .MuiInputBase-root {
        flex: auto;
    }

    & + p.Mui-error {
        font-size: 12px;
        color: ${({ theme }) => {
            return theme.colors.accent.firetruck;
        }};
        margin: 8px 0 0;
        font-weight: normal;
        letter-spacing: 0.4px;
        line-height: 16px;
    }
`;

export const TooltipAdornment = styled('span')`
    height: 32px;
    margin-left: 16px;
    margin-right: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 16px;
    box-sizing: border-box;
`;

export const InputAdornment = styled(InputAdornmentUI)`
    & > p {
        color: ${({ theme }) => {
            return theme.colors.gray[700];
        }}
`;
