import styled from 'styled-components';

export const StyledFormControlTheme = styled.div<{ size?: 'small' | 'medium' }>`
    * {
        box-sizing: border-box;
    }

    && {
        display: block;
    }

    .MuiInputLabel-root {
        font-weight: 500;
        font-size: 12px;
        letter-spacing: 0.4px;
        line-height: 16px;
        color: ${({ theme }) => theme.colors.gray[800]};
        margin-bottom: 6px;
        position: initial;
        width: 100%;
        transform: none;

        &.Mui-required > span.MuiFormLabel-asterisk {
            color: ${({ theme }) => theme.colors.accent.orange};
            font-size: 14px;
            font-weight: 500;
            letter-spacing: 0.18px;
            line-height: 15px;
        }

        &.Mui-focused,
        &.Mui-error {
            color: ${({ theme }) => theme.colors.gray[800]};
        }
    }

    .MuiInputBase-root {
        background-color: ${({ theme }) => theme.colors.gray[0]};
        border: 1px solid var(--eui-select-border);
        border-radius: ${({ theme }) => theme.border.radius};
        height: ${({ size }) => (size === 'medium' ? '40px' : '34px')};
        padding-right: 8px;
        margin: 0;
        padding-left: 0px;

        &:hover:not(.Mui-disabled):not(.Mui-error):not(.Mui-focused) {
            border-color: ${({ theme }) => theme.colors.gray[700]};
        }

        &.Mui-focused:not(.Mui-disabled) {
            border-color: ${({ theme }) => theme.colors.primary};
        }

        &.Mui-error {
            border-color: ${({ theme }) => theme.colors.accent.firetruck};
        }

        &.Mui-disabled {
            border-color: ${({ theme }) => theme.colors.gray[50]};
            background-color: ${({ theme }) => theme.colors.gray[50]};
        }

        .MuiOutlinedInput-notchedOutline {
            border: none;
        }
    }

    .MuiInputBase-input {
        box-sizing: border-box;
        border-radius: ${({ theme }) => theme.border.radius};
        background-color: ${({ theme }) => theme.colors.gray[0]};
        color: ${({ theme }) => theme.colors.gray[900]};
        font-size: 14px;
        font-weight: normal;
        letter-spacing: 0.25px;
        order: -1;
        padding: 14px 55px 14px 12px;

        &.Mui-disabled {
            color: ${({ theme }) => theme.colors.gray[700]};
            background-color: ${({ theme }) => theme.colors.gray[50]};
        }
    }

    .MuiInputAdornment-root {
        width: 24px;
        height: 24px;
        flex-shrink: 0;
        margin: 0;
        .MuiButtonBase-root {
            width: 100%;
            height: 100%;
            padding: 0;
            font-size: 16px;

            color: ${({ theme }) => theme.colors.gray[700]};
            &:hover {
                color: ${({ theme }) => theme.colors.gray[900]};
            }
        }
    }

    .MuiFormHelperText-root {
        font-weight: 400;
        font-size: 12px;
        letter-spacing: 0.4px;
        line-height: 16px;
        margin-top: 6px;
        margin-left: 0;
        transform: none;
    }
`;
