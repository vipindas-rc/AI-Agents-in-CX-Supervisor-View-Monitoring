import styled, { css } from 'styled-components';

import type IFormControl from './types/FormControl';
import { StyledTextField } from '../Inputs/TextInput/TextInput.styled';

export const StyledFormControl = styled.div<
    Omit<IFormControl, 'message' | 'title'>
>`
    position: relative;
    width: ${({ formWidth }) => formWidth || 'auto'};
    ${({ error, theme, highlightError }) =>
        error &&
        css`
            ${() =>
                highlightError &&
                `${StyledTextField} {
                    &,
                    &:hover {
                        border-color: ${theme.colors.accent.firetruck};
                    }
                }`}

            ${StyledMessage} {
                color: ${theme.colors.accent.firetruck};
                font-weight: 500;
            }
        `}
`;

export const StyledTitle = styled.label<{
    required: boolean;
    fitContent?: boolean;
    htmlFor?: string;
}>`
    padding-top: 0 !important;
    color: ${({ theme }) => theme.colors.gray[800]};
    font-size: ${({ theme }) => theme.font.size.label};
    font-weight: ${({ theme }) => theme.font.subheader.fontWeight};
    letter-spacing: 0.4px;
    line-height: 16px;
    margin: 0 0 6px;
    vertical-align: top;
    display: inline-block;
    overflow-wrap: break-word;
    width: 100%;

    ${({ theme }) =>
        theme.isSWIframe &&
        css`
            text-transform: capitalize;
        `}

    ${({ fitContent }) =>
        fitContent &&
        css`
            width: fit-content;
        `}

    ${({ required }) =>
        required &&
        css`
            &[required]:after {
                display: inline-block;
                margin-left: 3px;
                content: '\\002A';
                color: ${({ theme }) => theme.colors.accent.orange};
                font-size: 14px;
                font-weight: 500;
                letter-spacing: 0.18px;
                line-height: 15px;
            }
        `}
`;

export const StyledMessage = styled.p`
    margin: 8px 0 0;
    font-size: 12px;
    font-weight: normal;
    letter-spacing: 0.4px;
    line-height: 16px;
`;

export const StyledHeader = styled.div`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    margin-bottom: 6px;
    margin-top: 3px;

    ${StyledMessage} {
        margin: 0;
        font-weight: 500;
        text-align: right;
    }

    ${StyledTitle} {
        margin: 0;
        text-align: left;
        width: initial;
    }
`;
