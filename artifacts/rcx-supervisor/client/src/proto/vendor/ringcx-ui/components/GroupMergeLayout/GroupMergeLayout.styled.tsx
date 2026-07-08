import styled, { css } from 'styled-components';

import type { IGroupMergeLayout } from './types';

export const StyledMergeLayoutContainer = styled.div<{
    size: IGroupMergeLayout['size'];
    muiVersion?: IGroupMergeLayout['muiVersion'];
}>`
    display: flex;
    flex-wrap: nowrap;
    width: 100%;
    ${({ size }) => {
        return css`
            height: ${size.containerHeight};
        `;
    }}
    & .MuiSelect-select, & .MuiInputBase-input {
        ${({ size }) => {
            return css`
                padding: ${size.inputPadding};
            `;
        }}
    }

    // Overriding default Mui State
    .Mui-disabled {
        background: ${({ theme }) => theme.colors.gray[50]};
    }
    .MuiOutlinedInput-notchedOutline {
        border-color: ${({ theme }) => theme.colors.gray[300]};
    }
    .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline {
        border: 1px solid ${({ theme }) => theme.colors.primary};
        ${({ muiVersion }) => {
            if (muiVersion && muiVersion > 4) {
                return css`
                    z-index: 1;
                `;
            }
        }}
    }
    .MuiSelect-icon {
        z-index: 2;
    }
    .Mui-error {
        .MuiSelect-select,
        .MuiOutlinedInput-notchedOutline {
            border-color: ${({ theme }) => theme.colors.accent.firetruck};
            z-index: 1;
        }
    }

    // Overriding default MuiSelect style
    & .MuiSelect-select {
        height: ${({ size }) => {
            if (size.inputPaddingY) {
                return `calc(100% - ${size.inputPaddingY} - ${size.inputBorderY})`;
            }
            if (size.inputPadding.split(' ').length > 2) {
                return `calc(100% - ${
                    Number(size.inputPadding.split(' ')[0].replace('px', '')) +
                    Number(size.inputPadding.split(' ')[2].replace('px', ''))
                } - ${size.inputBorderY})`;
            }
            return '100%';
        }};
        border-color: ${({ theme }) => theme.colors.gray[300]};
        &:hover {
            border-color: ${({ theme }) => theme.colors.gray[700]};
        }
        &:focus {
            ${({ muiVersion }) => {
                if (muiVersion && muiVersion <= 4) {
                    return css`
                        border: 1px solid ${({ theme }) => theme.colors.primary};
                    `;
                }
            }}
            background: ${({ theme }) => theme.colors.gray[0]};
            .MuiSelect-icon {
                top: calc(50% - 13px);
                right: 1px;
            }
        }
    }

    & .MuiInputBase-root {
        height: 100%;
        &:hover {
            fieldset {
                border-color: ${({ theme }) => theme.colors.gray[700]};
            }
        }
        &:focus {
            border: 1px solid ${({ theme }) => theme.colors.gray[700]};
        }
    }

    // First and last child state
    & > div:first-child {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        .MuiInputBase-root,
        .MuiSelect-root {
            border-top-right-radius: 0;
            border-bottom-right-radius: 0;
        }
    }
    & > div:not(:first-child):not(:last-child) {
        border-radius: 0;
        .MuiInputBase-root,
        .MuiSelect-root {
            border-radius: 0;
        }
    }
    & > div:last-child {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
        .MuiInputBase-root,
        .MuiSelect-root {
            border-top-left-radius: 0;
            border-bottom-left-radius: 0;
        }
    }

    & > .MuiInputBase-root:not(:last-child),
    .MuiSelect-root:not(:last-child) {
        position: relative;
        left: 1px;
        &:focus,
        &:hover {
            z-index: 1;
        }
    }
    & > div:not(:last-child) {
        .MuiInputBase-root,
        .MuiSelect-root {
            position: relative;
            left: 0px;
            &:focus,
            &:hover {
                z-index: 1;
            }
        }
    }
`;
