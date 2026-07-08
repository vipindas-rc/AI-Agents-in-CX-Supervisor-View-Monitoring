import { alpha } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import { Dialog, StyledDialogContent } from '../Dialog';
import { GL_CLASSES, GridList } from '../GridList';

export const StyledDialog = styled(Dialog)`
    ${StyledDialogContent} {
        padding: 0;
        max-width: 100%;
        max-height: 100%;
        height: 100%;
        overflow: hidden;
        display: flex;
        flex-direction: column;
    }

    .MuiDialog-container {
        .MuiPaper-root {
            max-width: 1000px;
            width: 1000px;
            max-height: 500px;
            height: 500px;

            button.MuiIconButton-root {
                :hover {
                    background-color: transparent;
                }
            }

            .MuiTypography-h6 {
                font-weight: ${({ theme }) =>
                    theme.font.modal.headline.fontWeight};
                font-size: ${({ theme }) => theme.font.modal.headline.fontSize};
                line-height: ${({ theme }) =>
                    theme.font.modal.headline.lineHeight};
                letter-spacing: ${({ theme }) =>
                    theme.font.modal.headline.letterSpacing};
                color: ${({ theme }) => theme.font.color};
            }
        }
    }
`;

export const StyledHeader = styled.div`
    margin-bottom: 16px;
    position: relative;
    padding: 0 24px;
`;

export const NoMatchesFound = styled.div`
    color: ${({ theme }) => theme.colors.gray[800]};
    letter-spacing: 0;
    text-align: center;
    padding: 24px;

    &&:before {
        content: 'No matches found';
        display: block;
        font-size: 16px;
        font-style: italic;
        font-weight: 500;
    }
`;

/**
 * @deprecated
 * TODO: obsolete and needs to be removed
 */
export const StyledGridListBase = styled(GridList)<{
    disableDefaultOpenHighlight?: boolean;
    disableDefaultHoverHighlight?: boolean;
    disableDefaultCheckedHighlight?: boolean;
}>`
    // angular styles leak fix
    input[type='checkbox'] {
        margin: 0;
    }
    .${GL_CLASSES.HEAD_WRAPPER} {
        padding-top: 16px;
    }
    .${GL_CLASSES.HEAD} {
        height: 38px;
    }
    .${GL_CLASSES.ROW} {
        ${({ disableDefaultHoverHighlight }) =>
            !disableDefaultHoverHighlight &&
            css`
                &:hover {
                    background-color: ${({ theme }) => theme.colors.gray[50]};
                }
            `}

        ${({ disableDefaultCheckedHighlight }) =>
            !disableDefaultCheckedHighlight &&
            css`
                &:has(:checked):not(:hover) {
                    background-color: ${({ theme }) =>
                        alpha(theme.colors.primary, 0.07)};
                }
            `}
    }

    .${GL_CLASSES.ROW_GROUP} {
        .${GL_CLASSES.ROW} {
            &.${GL_CLASSES.ROW_OPEN} {
                ${({ disableDefaultOpenHighlight }) =>
                    !disableDefaultOpenHighlight &&
                    css`
                        div:first-of-type {
                            font-weight: 500;
                        }
                    `};
            }

            ${({ disableDefaultCheckedHighlight }) =>
                !disableDefaultCheckedHighlight &&
                css`
                    &:has(:checked):not(:hover) {
                        background-color: ${({ theme }) =>
                            theme.colors.gray[0]};
                    }
                `}
        }

        ${({ disableDefaultHoverHighlight, disableDefaultCheckedHighlight }) =>
            (!disableDefaultHoverHighlight ||
                !disableDefaultCheckedHighlight) &&
            css`
                .${GL_CLASSES.SUB_ROW} {
                    &:not(div:last-child) {
                        border-bottom: 1px solid
                            ${({ theme }) => theme.colors.gray[0]};
                    }
                }
            `}

        ${({ disableDefaultCheckedHighlight }) =>
            !disableDefaultCheckedHighlight &&
            css`
                .${GL_CLASSES.SUB_ROW} {
                    &:has(:checked):not(:hover) {
                        background-color: ${({ theme }) =>
                            alpha(theme.colors.primary, 0.07)};
                    }
                }
            `}

        ${({ disableDefaultHoverHighlight }) =>
            !disableDefaultHoverHighlight &&
            css`
                .${GL_CLASSES.SUB_ROW}, .${GL_CLASSES.ROW} {
                    &:hover {
                        background-color: ${({ theme }) =>
                            theme.colors.gray[50]};
                    }
                }

                &:has(.${GL_CLASSES.SUB_ROW}:hover) {
                    .${GL_CLASSES.ROW} {
                        background-color: ${({ theme }) =>
                            theme.colors.gray[50]};
                    }
                }
            `}
    }
`;
