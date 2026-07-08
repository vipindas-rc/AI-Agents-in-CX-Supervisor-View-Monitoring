import { forwardRef } from 'react';

import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogContentText,
    DialogTitle,
} from '@material-ui/core';
import { alpha, createStyles, withStyles } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import type {
    IStyledDialogContentProps,
    IStyledDialogTitleProps,
} from './types/Dialog';
import { focusVisibleStyles } from '../../helpers/accessibility/accessibility';
import { UNUSED } from '../../helpers/usage';
import { Close } from '../../icons';
import IconButton from '../IconButton/IconButton';

const StyledDialogTheme = createStyles({
    scrollPaper: {
        alignItems: 'flex-start',
    },
    paper: {
        marginTop: 60,
    },
});

const swIframeDialogScrollbarStyles = css`
    scrollbar-width: thin;
    scrollbar-color: ${({ theme }) =>
            `var(--line-background, ${theme.colors.gray[500]})`}
        transparent;

    &::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    &::-webkit-scrollbar-track {
        background: transparent;
    }

    &::-webkit-scrollbar-thumb {
        background-color: ${({ theme }) =>
            `var(--line-background, ${theme.colors.gray[500]})`};
        border-radius: 8px;
        border: 2px solid transparent;
        background-clip: padding-box;
    }
`;

export const StyledCloseIcon = styled(Close)`
    color: ${({ theme }) => `var(--action-icon, ${theme.colors.gray[700]})`};
`;

const ThemedDialog = withStyles(StyledDialogTheme)(Dialog);

export const StyledDialog = styled(ThemedDialog)<{
    $visible: boolean;
    fullScreen?: boolean;
}>`
    [class^='MuiBackdrop-root'] {
        background-color: ${({ theme }) =>
            theme.isSWIframe
                ? 'var(--modal-backdrop-bg, #000)'
                : alpha(theme.colors.gray[900], 0.3)};
        ${({ theme }) =>
            theme.isSWIframe &&
            css`
                /* !important is needed here to override MUI inline backdrop styles in order to match native SW modal behavior. */
                opacity: 0.5 !important;
                transition: none !important;
            `}
    }
    .MuiDialog-container {
        overflow-y: auto;
        ${({ theme }) =>
            theme.isSWIframe &&
            css`
                ${swIframeDialogScrollbarStyles}
            `}
    }
    .MuiDialog-paper {
        max-height: none;
        ${({ theme }) =>
            theme.isSWIframe &&
            css`
                ${swIframeDialogScrollbarStyles}
            `}
        ${({ fullScreen }) =>
            fullScreen &&
            css`
                @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
                    margin-top: 0;
                    .MuiDialogTitle-root {
                        padding: 16px;
                        h2 {
                            font-size: 16px;
                            padding-right: 12px;
                        }
                    }
                    .MuiDialogActions-root {
                        padding: 16px;
                        border-top: 1px solid
                            ${({ theme }) => theme.colors.gray[100]};
                    }
                }
            `}
    }
    ${({ $visible }) =>
        $visible &&
        css`
            visibility: hidden;
            opacity: 0;
            pointer-events: none;
        `}
`;

export const StyledDialogContent = styled(
    forwardRef(
        (
            {
                maxWidth,
                scrollable,
                withBorder,
                children,
                ...rest
            }: IStyledDialogContentProps,
            ref
        ) => {
            UNUSED(maxWidth, scrollable, withBorder);
            return (
                <DialogContent ref={ref} {...rest}>
                    {children}
                </DialogContent>
            );
        }
    )
)`
    && {
        @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
            min-width: auto;
            max-width: auto;
        }

        min-width: 400px;
        max-width: 700px;
        min-height: 32px;
        overflow-x: hidden;
        padding: ${({ maxWidth }) =>
            `0 ${maxWidth === 'xs' ? '22px' : '24px'} 12px`};
        box-shadow: ${({
            theme,
        }) => `0 4px 5px 0 var(--background-transparent, ${alpha(
            theme.colors.gray[0],
            0.14
        )}),
                0 1px 10px 0 var(--background-transparent, ${alpha(
                    theme.colors.gray[0],
                    0.12
                )}),
                0 1px 4px -1px var(--background-transparent, ${alpha(
                    theme.colors.gray[0],
                    0.2
                )})`};

        ${({ scrollable }) =>
            scrollable &&
            css<IStyledDialogContentProps>`
                max-height: 60vh;
                position: relative;
                border-bottom: ${({ withBorder }) => withBorder && '1px solid'};
                border-bottom-color: ${({ theme }) =>
                    `var(--line-background, ${theme.colors.gray[100]})`};
                ${({ theme }) =>
                    theme.isSWIframe &&
                    css`
                        ${swIframeDialogScrollbarStyles}
                    `}
            `}
    }
`;
export const StyledDialogContentText = styled(DialogContentText)<{
    $secondary?: boolean;
}>`
    && {
        color: ${({ theme, $secondary }) =>
            $secondary
                ? `var(--primary-text-color, ${theme.colors.gray[900]})`
                : `var(--secondary-text-color, ${theme.colors.gray[800]})`};
        font-size: ${({ theme }) => theme.font.size.base};
        font-weight: normal;
        letter-spacing: 0.25px;
        line-height: 20px;
    }
`;

export const StyledDialogTitle = styled(
    ({ withShadow, children, ...rest }: IStyledDialogTitleProps) => {
        UNUSED(withShadow);
        return <DialogTitle {...rest}>{children}</DialogTitle>;
    }
)`
    && {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        padding: 24px;
        z-index: 1;

        box-shadow: ${({ withShadow, theme }) =>
            withShadow &&
            `0 1px 0 0 var(--line-background, ${theme.colors.gray[100]})`};

        h2 {
            padding-right: 24px;
            color: ${({ theme }) =>
                `var(--primary-text-color, ${theme.colors.gray[900]})`};
            font-size: ${({ theme }) =>
                `var(--modal-header-font-size, ${theme.font.size.heading2})`};
            font-weight: ${({ theme }) =>
                `var(--modal-header-font-weight, ${theme.font.weight.medium})`};
            letter-spacing: 0.15px;
            line-height: ${({ theme }) => theme.font.lineHeight.heading2};
            overflow-wrap: break-word;
            width: 100%;
            box-sizing: border-box;
            margin: 0;
        }
    }
`;
export const StyledDialogActions = styled(DialogActions)`
    && {
        padding: 24px;
        height: auto;
        box-sizing: border-box;
        button:not(:first-child) {
            margin-left: 24px;
        }
    }
`;
export const StyledDialogIconButton = styled(IconButton)`
    && {
        position: absolute;
        right: 28px;
        top: 28px;
        font-size: 14px;
        font-weight: bold;
        padding: 0;
        z-index: 5;
        height: 24px;
        width: 24px;

        &:hover {
            background-color: transparent;
            ${StyledCloseIcon} {
                color: ${({ theme }) =>
                    `var(--primary-text-color, ${theme.colors.gray[900]})`};
            }
        }

        &:focus-visible {
            ${focusVisibleStyles}
        }

        &:disabled {
            ${StyledCloseIcon} {
                cursor: default;
                color: ${({ theme }) =>
                    `var(--action-icon-disabled, ${theme.colors.gray[400]})`};
            }
        }
    }
`;

export const StyledDialogBottomText = styled.p`
    && {
        color: ${({ theme }) =>
            `var(--primary-text-color, ${theme.colors.gray[900]})`};
        font-size: 14px;
        font-weight: normal;
        letter-spacing: 0.25px;
        line-height: 20px;
        position: absolute;
        left: 24px;
        bottom: 22px;
        margin: 12px 0;
    }
`;
