import { Box, Popper, TextField, Tooltip } from '@mui/material';
import { css, styled } from 'styled-components';

export const StyledTextField = styled(TextField)<{ isOpen: boolean }>`
    label {
        position: static;
        font-weight: ${({ theme }) => theme.font.contentHeader.fontWeight};
        color: ${({ theme }) => {
            return theme.colors.gray[800];
        }};
        margin-bottom: 6px;
        transform: none;
        font-size: ${({ theme }) => theme.font.size.label};
        line-height: 16px;

        ${({ theme }) =>
            theme.isSWIframe &&
            css`
                text-transform: capitalize;
            `}
        .MuiInputLabel-asterisk {
            color: ${({ theme }) => {
                return theme.colors.error;
            }};
            font-size: 12px;
        }
        &.Mui-focused,
        &.Mui-error {
            color: ${({ theme }) => {
                return theme.colors.gray[800];
            }};
        }
        font-family: ${({ theme }) => theme.font.family};
    }

    .MuiInputBase-root {
        font-family: ${({ theme }) => theme.font.family};
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

        border-radius: ${({ theme, isOpen }) => {
            return isOpen
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
            }
        }
        .MuiAutocomplete-clearIndicator {
            visibility: visible;
        }

        ${({ error, theme }) =>
            error &&
            css`
                border-color: ${theme.colors.accent.firetruck};
            `}

        ${({ disabled, theme }) =>
            disabled &&
            css`
                background-color: ${theme.colors.gray[50]};
                color: ${theme.colors.gray[700]};
                border: none;
            `}
    }
    && {
        & .MuiOutlinedInput-root {
            input {
                font-size: 14px;
                padding: 4px 4px 5px 0;
            }
        }
    }

    .MuiOutlinedInput-root:not(.Mui-disabled):hover {
        border: 1px solid ${({ theme }) => theme.colors.gray[700]};
    }
    .MuiOutlinedInput-notchedOutline {
        border: none;
    }
    .MuiAutocomplete-popupIndicator:hover {
        background: none !important;
    }
    .MuiOutlinedInput-root.Mui-focused {
        border: 1px solid ${({ theme }) => theme.colors.primary};
    }
`;

export const StyledTooltip = styled(Tooltip)`
    margin-top: 22px;
`;

export const StyledBox = styled(Box)`
    &&& {
        display: flex;
        justify-content: space-between;
    }

    & span:last-child {
        font-family: Roboto;
        font-weight: 700;
        font-size: 12px;
        letter-spacing: 0.4px;
        line-height: 16px;
        text-transform: uppercase;
    }

    & span:first-child {
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
`;

export const StyledDisplayName = styled.span`
    font-family: 'Roboto';
    font-weight: 700;
    font-size: 12px;
    letter-spacing: 0.4px;
    line-height: 16px;
    color: #a1a1a1;
    margin-right: -5px;
`;

export const AutoCompleteWrapper = styled('div')`
    display: flex;
    position: relative;
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
        & .MuiAutocomplete-option {
            font-family: ${({ theme }) => theme.font.family};
            font-weight: ${({ theme }) => theme.font.contentHeader.fontWeight};
        }
        border-top: 0;
        & li {
            border: none !important;
            font-size: 14px;
            font-weight: 500;
            height: 32px;
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
            }
        }
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
