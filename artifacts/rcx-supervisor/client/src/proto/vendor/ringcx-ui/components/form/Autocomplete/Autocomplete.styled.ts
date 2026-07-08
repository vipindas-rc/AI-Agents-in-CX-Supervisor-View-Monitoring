import { Popper, TextField, Tooltip } from '@mui/material';
import { css, styled } from 'styled-components';

import { focusVisibleStyles } from '../../../helpers/accessibility';

export const StyledTextField = styled(TextField)<{ $isOpen: boolean }>`
    label {
        position: static;
        font-family: ${({ theme }) => theme.font.family};
        font-weight: ${({ theme }) => theme.font.subheader.fontWeight};
        color: ${({ theme }) => {
            return theme.colors.gray[800];
        }};
        margin-bottom: 6px;
        transform: none;
        font-size: ${({ theme }) => theme.font.size.label};

        ${({ theme }) =>
            theme.isSWIframe &&
            css`
                text-transform: capitalize;
            `}

        &.Mui-focused,
        &.Mui-error {
            color: ${({ theme }) => {
                return theme.colors.gray[800];
            }};
        }

        .MuiInputLabel-asterisk {
            color: ${({ theme }) => {
                return theme.colors.accent.orange;
            }};
            font-size: 14px;
            position: absolute;
        }
    }

    .MuiInputBase-root,
    .MuiInputBase-root.MuiOutlinedInput-root {
        margin-top: 0;
        border: 1px solid
            ${({ theme }) => {
                return theme.colors.gray[300];
            }};
        transition: none;
        padding: 0 12px;
        background-color: ${({ theme }) => {
            return theme.colors.background;
        }};

        border-radius: ${({ theme, $isOpen }) => {
            return $isOpen
                ? `${theme.border.radius} ${theme.border.radius} 0 0 `
                : theme.border.radius;
        }};

        min-height: 32px;
        ::before,
        ::after {
            border: none;
        }

        &:hover:not(.Mui-disabled):before {
            border: none;
        }

        .MuiAutocomplete-endAdornment {
            top: calc(50% - 12px);
            right: 8px;
            & > .MuiAutocomplete-clearIndicator {
                margin-left: 4px;
                margin-right: 0;
            }
            & > .MuiAutocomplete-popupIndicator {
                margin-left: 0px;
                margin-right: 0;
            }
            & > button {
                height: 24px;
                width: 24px;
                padding: 0;
                color: ${({ theme }) => theme.colors.gray[700]};
                &:hover {
                    color: ${({ theme }) => theme.colors.gray[900]};
                    background: ${({ theme }) => theme.colors.gray[100]};
                }
                ${focusVisibleStyles}
            }
        }
        .MuiAutocomplete-clearIndicator {
            visibility: visible;
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
            `}
    }
    && {
        & .MuiOutlinedInput-root {
            input {
                font-size: 14px;
                padding: 4px 4px 5px 0;
                font-family: ${({ theme }) => theme.font.family};
            }
        }
    }

    .MuiOutlinedInput-notchedOutline {
        border: none;
    }
    .MuiOutlinedInput-root:not(.Mui-disabled):hover {
        border: 1px solid ${({ theme }) => theme.colors.gray[700]};
    }
    .MuiAutocomplete-popupIndicator:hover {
        background: none !important;
    }
    .MuiOutlinedInput-root.Mui-focused {
        border: 1px solid ${({ theme }) => theme.colors.primary};
    }
    .MuiFormHelperText-root {
        font-size: 12px;
        line-height: 16px;
        margin: 8px 0 0;
        color: ${({ theme }) => theme.colors.accent.firetruck};
    }
`;

export const AutoCompleteWrapper = styled('div')`
    display: flex;
    position: relative;
`;

export const StyledTooltip = styled(Tooltip)`
    margin-top: 22px;
`;

export const StyledPopper = styled(Popper)`
    &&& {
        & .MuiPaper-root {
            border-radius: ${({ theme }) =>
                `0 0 ${theme.border.radius} ${theme.border.radius}`};
            border-top: 1px solid ${({ theme }) => theme.colors.gray[100]};
            box-shadow: rgba(171, 171, 171, 0.5) 0px 2px 12px 0px !important;
            clip-path: inset(0px -20px -20px -20px);
        }
        border-top: 0;
        & .MuiAutocomplete-option {
            font-weight: ${({ theme }) => theme.font.contentHeader.fontWeight};
            font-size: ${({ theme }) => theme.font.size.base};
            min-height: 32px;
            font-family: ${({ theme }) => theme.font.family};
            &:hover {
                background-color: ${({ theme }) => {
                    return theme.colors.gray[300];
                }};
            }
            &[aria-selected='true'] {
                background-color: ${({ theme }) => {
                    return theme.colors.primary;
                }};
                color: ${({ theme }) => {
                    return theme.colors.gray[0];
                }};
                & .secondary-label {
                    color: ${({ theme }) => {
                        return theme.colors.gray[0];
                    }};
                }
            }
        }
    }
`;

export const ListGroupHeading = styled.li`
    display: flex;
    box-sizing: border-box;
    font-size: 12px;
    font-weight: bold;
    height: 16px;
    letter-spacing: 0.4px;
    line-height: 16px;
    text-transform: uppercase;
    padding: 8px 16px;
    margin: 0;
    min-height: 32px;
    color: ${({ theme }) => theme.colors.gray[700]};
    white-space: nowrap;
`;

export const SecondaryDisplayName = styled.span<{ selectedOption: boolean }>`
    font-size: 14px;
    font-weight: 400;
    color: ${({ theme, selectedOption }) =>
        selectedOption ? theme.colors.gray[0] : theme.colors.gray[800]};
`;

export const FooterMessage = styled.div<{ showTopBorder?: boolean }>`
    width: 100%;
    height: 38px;
    font-size: ${({ theme }) => theme.font.subheader.fontSize};
    font-weight: ${({ theme }) => theme.font.weight.regular};
    line-height: ${({ theme }) => theme.font.lineHeight.footer};
    padding: 9px 16px;
    letter-spacing: 0.25px;
    color: ${({ theme }) => theme.colors.gray[700]};
    border-top: 1px solid
        ${({ theme, showTopBorder }) =>
            showTopBorder ? theme.colors.gray[300] : 'none'};
`;
