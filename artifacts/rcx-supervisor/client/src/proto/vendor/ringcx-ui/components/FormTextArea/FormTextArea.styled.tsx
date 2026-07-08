import type { DefaultTheme } from 'styled-components';
import styled, { css } from 'styled-components';

const getInputBaseStyles = (theme: DefaultTheme, error?: boolean) => {
    return css`
        width: 100%;
        display: block;
        padding: 6px 12px;
        font-family: ${theme.font.family};
        font-size: ${theme.font.size.base};
        line-height: 20px;
        font-weight: normal;
        letter-spacing: 0.25px;
        border-width: 1px;
        border-style: solid;
        border-radius: ${theme.border.radius};
        box-shadow: none;
        color: ${theme.font.color};
        box-sizing: border-box;

        border-color: ${error ? theme.colors.error : theme.colors.gray[300]};
        background-color: ${theme.colors.background};

        &:hover:not(:disabled):not(:focus) {
            border-color: ${error
                ? theme.colors.error
                : theme.colors.gray[700]};
        }

        &:focus {
            outline: none;
            border-color: ${theme.colors.primary};
        }

        &::placeholder {
            color: ${theme.colors.gray[700]};
        }

        &:disabled {
            color: ${theme.colors.gray[700]};

            &::placeholder {
                color: ${theme.colors.gray[700]};
            }
        }
    `;
};

export const StyledTextArea = styled.textarea<{
    error?: boolean;
}>`
    height: 80px;
    resize: none;
    ${({ theme, error }) => getInputBaseStyles(theme, error)}
`;

export const StyledOverlayContainer = styled.div<{ title?: string }>`
    position: absolute;
    width: 100%;
    height: ${({ title }) => (title ? 'calc(100% - 22px)' : '100%')};
    padding: 6px 12px;
    flex-direction: column;
    display: flex;
    align-items: flex-start;
    justify-content: flex-start;
    overflow-x: hidden;
    overflow-y: auto;
    word-break: break-word;
    font-size: 14px;
    line-height: 20px;
    font-weight: normal;
    letter-spacing: 0.25px;
    border-width: 1px;
    border-style: solid;
    border-radius: 4px;
    box-shadow: none;
    color: ${({ theme }) => theme.colors.gray[900]};
    box-sizing: border-box;
    border-color: ${({ theme }) => theme.colors.gray[300]};
    white-space: pre-line;
    background-color: ${({ theme }) => theme.colors.background};
`;
