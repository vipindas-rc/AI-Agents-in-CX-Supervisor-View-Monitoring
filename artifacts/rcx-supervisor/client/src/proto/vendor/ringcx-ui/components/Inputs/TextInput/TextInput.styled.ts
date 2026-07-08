import styled, { css } from 'styled-components';

import type { IStyledTextInput } from './types';
import type { TextInputSizes } from './types/TextInput';

export const StyledTextField = styled.div<IStyledTextInput>`
    position: relative;
    width: 100%;
    border: 1px solid
        ${({ theme }) => `var(--text-input-border, ${theme.colors.gray[300]})`};
    background-color: ${({ theme }) =>
        `var(--text-input-background, ${theme.colors.background})`};
    height: ${({ inputSize }) => (inputSize === 'medium' ? 40 : 32)}px;
    border-radius: ${({ theme }) => theme.border.radius};
    display: flex;
    align-items: center;
    box-sizing: border-box;

    ${({ disabled }) => {
        if (disabled) {
            return css`
                background-color: ${({ theme }) => theme.colors.gray[50]};
                border-color: ${({ theme }) => theme.colors.gray[50]};
            `;
        }

        return css`
            &:hover {
                border-color: ${({ theme }) => theme.colors.gray[700]};
            }
        `;
    }}
`;

export const StyledUnits = styled.span<{ size: TextInputSizes }>`
    order: 3;
    border-radius: ${({ theme }) => theme.border.radius};
    height: ${({ size }) => (size === 'medium' ? 38 : 30)}px;
    line-height: ${({ size }) => (size === 'medium' ? 39 : 31)}px;
    font-size: 14px;
    font-weight: normal;
    letter-spacing: 0.4px;
    color: ${({ theme }) => theme.colors.gray[700]};
    padding: 0 12px 0 0;
`;

export const StyledTextInput = styled.input<IStyledTextInput>`
    order: 2;
    outline: none;
    width: 100%;
    border: none;
    border-radius: ${({ theme }) => theme.border.radius};
    /* Cross-browser analog 'transparent' keyword */
    background-color: rgba(255, 255, 255, 0);
    padding: 0 12px;
    color: ${({ theme }) =>
        `var(--text-input-text, ${theme.colors.gray[900]})`};
    font-size: ${({ theme }) => theme.font.size.base};
    font-weight: normal;
    letter-spacing: 0.25px;
    height: ${({ inputSize }) => (inputSize === 'medium' ? 38 : 30)}px;
    flex-grow: 1;

    &::placeholder {
        color: ${({ theme }) => theme.colors.gray[700]};
    }

    &:disabled {
        color: ${({ theme }) => theme.colors.gray[700]};
        &::placeholder {
            color: ${({ theme }) => theme.colors.gray[700]};
        }
        ${StyledUnits} {
            color: ${({ theme }) => theme.colors.gray[700]};
        }
    }
`;

export const StyledLeftIcon = styled.div<{
    size: TextInputSizes;
}>`
    order: 1;
    width: ${({ size }) => (size === 'medium' ? 24 : 20)}px;
    height: ${({ size }) => (size === 'medium' ? 24 : 20)}px;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    margin-left: 12px;
    color: ${({ theme }) => theme.colors.gray[400]};
`;

export const StyledTextFieldWrapper = styled.div`
    display: flex;
    align-items: center;

    &.error-field {
        --text-input-border-focus: ${({ theme }) => theme.colors.error};
    }

    &:has(${StyledTextInput}:focus-within) {
        ${StyledLeftIcon} {
            color: ${({ theme }) => theme.colors.gray[700]};
        }

        ${StyledTextField} {
            border-color: ${({ theme }) =>
                `var(--text-input-border-focus, ${theme.colors.primary})`};

            &:hover {
                border-color: ${({ theme }) =>
                    `var(--text-input-border-focus, ${theme.colors.primary})`};
            }
        }
    }
`;

export const StyledRightIcon = styled.div<{
    size: TextInputSizes;
    disabled?: boolean;
}>`
    min-width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex-shrink: 0;
    order: 4;
    margin: 0 7px 0 3px;
    box-sizing: border-box;
    font-size: 20px;
    button {
        width: 24px;
        height: 24px;
        padding: 0;
    }
    i,
    svg {
        color: ${({ disabled, theme }) =>
            theme.colors.gray[disabled ? 700 : 500]};
    }
`;
