import { alpha } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import {
    BORDER_RADIUS,
    LIST_ITEM_EDGE_PADDING,
    SMALL_TOGGLE_HEIGHT,
    TOGGLE_BORDER,
    TOGGLE_HEIGHT,
} from './constants';
import type { DropDownSizes, IDisplayItem, OpenDirection } from './types';
import type { IAdornment } from '../Adornment/types';
import { TextEclipse } from '../TextEclipse';

export const DropDownBorder = styled.div<{
    disabled: boolean;
    isOpen: boolean;
    error?: boolean;
    openDirection?: OpenDirection;
}>`
    && {
        box-sizing: border-box;
        width: 100%;
        border-radius: ${BORDER_RADIUS}px;
        outline: none;

        border-style: solid;
        border-width: ${({ isOpen }) => (isOpen ? 0 : TOGGLE_BORDER)}px;
        border-color: ${({ theme, error }) =>
            error ? theme.colors.accent.firetruck : theme.colors.gray[300]};

        ${({ theme, isOpen, error }) =>
            !isOpen && error
                ? css`
                      border-color: ${theme.colors.accent.firetruck};
                  `
                : css`
                      border-color: ${theme.colors.gray[300]};

                      &:hover {
                          border-color: ${theme.colors.gray[500]};
                      }
                  `}
        &:focus:not(:active) {
            border-color: ${({ error, theme, disabled }) =>
                !disabled &&
                (error ? theme.colors.accent.firetruck : theme.colors.primary)};
        }

        ${({ isOpen, theme }) =>
            isOpen &&
            css`
                position: absolute;
                left: 0;
                top: 0;
                //TODO: use theme variable
                z-index: 5;
                //TODO: use bax-shadow from single dropdown
                overflow: hidden;

                &,
                &:focus {
                    box-shadow: 0 2px 12px 0
                        ${`var(--box-shadow-2, ${alpha(
                            theme.colors.gray[600],
                            0.5
                        )})`} !important;
                }
            `}

        ${({ disabled, theme }) =>
            disabled &&
            css`
                &,
                &:focus,
                &:hover {
                    border-color: ${theme.colors.gray[50]};
                    background-color: ${theme.colors.gray[50]};
                }
            `}
        ${({ isOpen, openDirection }) =>
            isOpen &&
            openDirection === 'up' &&
            css`
                display: flex;
                flex-direction: column-reverse;
                top: auto;
                bottom: 0;
            `}
    }
`;

export const DropDownWrapper = styled.div<{
    disabled: boolean;
    isOpen: boolean;
    width?: number;
    size: DropDownSizes;
    endAdornment?: Omit<IAdornment, 'legacyMode' | 'offset'> | undefined;
}>`
    width: ${({ width, size, endAdornment }) => {
        if (width) {
            return `${width}px`;
        } else if (endAdornment) {
            return size === 'small' ? 'calc(100% - 41px)' : 'calc(100% - 45px)';
        }
        return '100%';
    }};
    box-sizing: border-box;
    border-radius: ${BORDER_RADIUS}px;
    min-height: ${({ size }) =>
        size === 'medium' ? TOGGLE_HEIGHT : SMALL_TOGGLE_HEIGHT}px;
    background-color: ${({ theme }) =>
        `var(--content-background, ${theme.colors.background})`};
    position: relative;

    &:focus {
        ${DropDownBorder} {
            border-color: ${({ theme }) => theme.colors.gray[500]};
        }
    }
`;

export const StyledDropDownWrapper = styled.div`
    display: flex;
    align-items: center;
`;

export const TextEclipseStyled = styled(TextEclipse)``;

export const StyledPlaceholder = styled.span<IDisplayItem>`
    font-size: ${({ theme }) => theme.font.size.base};
    height: 20px;
    letter-spacing: 0.25px;
    color: ${({ theme, showExistItem }) =>
        showExistItem
            ? `var(--primary-text-color, ${theme.colors.gray[900]})`
            : `var(--text-input-text-placeholder, ${theme.colors.gray[700]})`};
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    flex: 1;

    ${TextEclipseStyled} {
        vertical-align: unset;
    }
`;

export const StyledList = styled.div<{
    openDirection: OpenDirection;
    listItemHeight: number;
}>`
    width: 100%;
    box-shadow: none;
    background-color: ${({ theme }) =>
        `var(--menu-background, ${theme.colors.background})`};
    display: block;
    border: none;
    max-height: ${({ listItemHeight }) =>
        listItemHeight * 7 + LIST_ITEM_EDGE_PADDING * 2}px;
    ${({ openDirection, theme }) =>
        openDirection === 'up'
            ? css`
                  border-bottom: 1px solid ${theme.colors.gray[100]};
              `
            : css`
                  border-top: 1px solid ${theme.colors.gray[100]};
              `};
    .MuiDialog-container & {
        background-color: ${({ theme }) => theme.colors.background};
    }
`;
