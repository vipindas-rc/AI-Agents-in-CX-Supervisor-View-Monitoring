import { alpha } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import {
    TOGGLE_HEIGHT,
    SMALL_TOGGLE_HEIGHT,
    TOGGLE_BORDER,
    TOGGLE_H_PADDING,
    BORDER_RADIUS,
} from '../../../constants';
import { StyledPlaceholder } from '../../../DropDown.styled';
import type { DropDownSizes, IDisplayItem } from '../../../types';

export const StyledToggle = styled.div<{
    disabled: boolean;
    isOpen: boolean;
    size: DropDownSizes;
}>`
    && {
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        width: 100%;
        height: ${({ size, isOpen }) =>
            (size === 'medium' ? TOGGLE_HEIGHT : SMALL_TOGGLE_HEIGHT) -
            (isOpen ? 0 : 2 * TOGGLE_BORDER)}px;
        cursor: pointer;
        padding: 0 ${({ isOpen }) => (isOpen ? 12 : 11)}px;

        font-weight: normal;
        text-transform: none;
        background-color: ${({ disabled, theme }) =>
            disabled ? theme.colors.gray[50] : theme.colors.background};
        color: ${({ disabled, theme }) =>
            disabled ? theme.colors.gray[700] : theme.font.color};
        border-radius: ${({ isOpen }) =>
            isOpen
                ? `${BORDER_RADIUS}px ${BORDER_RADIUS}px 0 0`
                : `${BORDER_RADIUS}px`};

        ${({ disabled, theme }) =>
            disabled &&
            css`
                cursor: not-allowed;
                ${StyledPlaceholder} {
                    color: ${theme.colors.gray[700]};
                }
            `}
    }
`;

export const StyledToggleFilter = styled.input<IDisplayItem>`
    border: none;
    outline: none;
    padding: 0;
    width: calc(100% - ${TOGGLE_HEIGHT - TOGGLE_H_PADDING}px);
    font-size: ${({ theme }) => theme.font.size.base};
    letter-spacing: 0.25px;
    line-height: 20px;
    caret-color: ${({ theme }) => theme.colors.gray[900]};
    background-color: transparent;

    &::placeholder {
        color: ${({ theme }) => theme.colors.gray[700]};
    }
`;

export const StyledDotVariant = styled.div`
    display: grid;
    grid-template-columns: 12px auto;
    grid-gap: 8px;
    align-items: center;
    overflow: hidden;
`;

export const StyledCloseIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    color: ${({ theme }) => theme.colors.gray[700]};
    cursor: pointer;
    outline: none;

    &:hover {
        color: ${({ theme }) => theme.colors.gray[900]};
        background: ${({ theme }) =>
            `var(--menu-item-hover, ${alpha(theme.colors.gray[700], 0.17)})`};
    }

    &:focus-visible {
        color: ${({ theme }) => theme.colors.gray[900]};
        background: ${({ theme }) =>
            `var(--menu-item-hover, ${alpha(theme.colors.gray[700], 0.17)})`};
        box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[500]};
    }
`;
