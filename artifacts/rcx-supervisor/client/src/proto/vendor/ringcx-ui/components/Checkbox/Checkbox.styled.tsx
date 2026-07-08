import { Checkbox, FormControlLabel } from '@material-ui/core';
import styled from 'styled-components';

export const StyledCheckbox = styled(Checkbox)`
    align-self: flex-start;
    margin-top: 2px;
    padding: 0;

    &:hover {
        background-color: transparent;
    }
    input:focus-visible + svg {
        outline: 2px solid ${({ theme }) => theme.colors.primary} !important;
        outline-offset: 2px;
        border-radius: 4px;
    }

    input {
        width: 16px;
        height: 16px;
        margin: 0;

        &:not([data-indeterminate='true']):not(:checked) + svg {
            rect {
                stroke: ${({ theme }) =>
                    `var(--checkbox-border, ${theme.colors.gray[700]})`};
            }
        }

        &[data-indeterminate='true'] + svg {
            rect {
                fill: ${({ theme }) =>
                    `var(--checkbox-background, ${theme.colors.primary})`};
            }
        }
    }

    &[aria-disabled='true'] {
        input:not([data-indeterminate='true']):not(:checked) + svg {
            rect {
                stroke: ${({ theme }) =>
                    `var(--checkbox-border-disabled, ${theme.colors.gray[300]})`};
            }
        }
    }

    span[class^='Mui-checked'],
    span[class*='Mui-checked'] {
        ${({ theme, disabled }) =>
            !disabled &&
            `color: var(--checkbox-checked, ${theme.colors.primary});`}
    }
`;

export const StyledFormControlLabel = styled(FormControlLabel)`
    && {
        user-select: none;
        margin: 0;

        span[class^='Mui-checked'],
        span[class*='Mui-checked'] {
            ${({ theme, disabled }) =>
                !disabled &&
                `color: var(--checkbox-checked, ${theme.colors.primary});`}
        }

        span[class^='MuiFormControlLabel-label'],
        span[class*=' MuiFormControlLabel-label'] {
            font-size: ${({ theme }) => theme.font.size.base} !important;
            font-weight: normal;
            letter-spacing: 0.25px;
            line-height: 20px;
            margin-left: 12px;
            ${({ theme, disabled }) =>
                !disabled &&
                `color: var(--checkbox-text, ${theme.colors.gray[900]});`}
            text-transform: none;
            word-break: break-word;

            &:hover {
                cursor: ${({ disabled }) => (disabled ? 'default' : 'pointer')};
            }
        }
    }
`;

export const StyledLabelWrapper = styled.div`
    display: flex;
    align-items: center;
    width: 100%;
`;
