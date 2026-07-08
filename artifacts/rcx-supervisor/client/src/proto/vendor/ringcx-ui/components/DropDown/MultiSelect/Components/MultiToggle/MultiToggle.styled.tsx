import { alpha } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import {
    ItemsWrapper,
    ToggleContent,
} from './components/MultiToggleContent/MultiToggleContent.styled';
import { StyledChip } from './components/MultiToggleItem/MultiToogleItem.styled';
import { Spinner } from '../../../../Spinner/Spinner.styled';
import ArrowIcon from '../../../Components/ArrowIcon';
import {
    TOGGLE_BORDER,
    BORDER_RADIUS,
    TOGGLE_HEIGHT,
    SMALL_TOGGLE_HEIGHT,
    ITEM_HEIGHT,
    SMALL_ITEM_HEIGHT,
    ITEM_GAP,
    SMALL_ITEM_GAP,
} from '../../../constants';
import { StyledPlaceholder } from '../../../DropDown.styled';
import type { DropDownSizes } from '../../../types';

export const StyledItemsWrapper = styled(ItemsWrapper)`
    width: auto;
    flex-wrap: wrap;
    max-width: 100%;
`;

export const StyledToggleContent = styled(ToggleContent)``;

export const StyledToggleFilter = styled.input`
    border: none;
    outline: none;
    padding: 0;
    display: flex;
    flex-grow: 1;
    min-width: 15px;
    font-size: 14px;
    letter-spacing: 0.25px;
    line-height: 21px;
    caret-color: ${({ theme }) =>
        `var(--primary-text-color, ${theme.colors.gray[900]})`};
    background-color: ${({ theme }) => theme.colors.background};

    &::placeholder {
        color: ${({ theme }) =>
            `var(--text-input-text-placeholder, ${theme.colors.gray[700]})`};
    }
`;

export const StyledSpinner = styled(Spinner)`
    && {
        position: absolute;
        right: 12px;
    }
`;

export const StyledArrowIcon = styled(ArrowIcon)`
    && {
        position: absolute;
        top: 13px;
        right: 12px;
    }
`;

export const StyledCloseIcon = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    color: ${({ theme }) => theme.colors.gray[700]};
    cursor: pointer;
    outline: none;

    &:hover {
        color: ${({ theme }) => theme.colors.gray[900]};
        background: ${({ theme }) =>
            `var(--menu-item-hover, ${alpha(theme.colors.gray[700], 0.17)})`};
    }

    &:focus {
        color: ${({ theme }) => theme.colors.gray[900]};
        background: ${({ theme }) =>
            `var(--menu-item-hover, ${alpha(theme.colors.gray[700], 0.17)})`};
        box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primary[500]};
    }
`;

export const StyledMultiToggle = styled.div<{
    disabled: boolean;
    isOpen: boolean;
    size: DropDownSizes;
}>`
    && {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-sizing: border-box;
        width: 100%;
        cursor: pointer;
        min-height: ${({ size }) =>
            (size === 'medium' ? TOGGLE_HEIGHT : SMALL_TOGGLE_HEIGHT) -
            2 * TOGGLE_BORDER}px;
        font-weight: normal;
        text-transform: none;
        background-color: ${({ disabled, theme }) =>
            disabled ? theme.colors.gray[50] : theme.colors.background};
        color: ${({ disabled, theme }) =>
            disabled ? theme.colors.gray[400] : theme.font.color};
        border-radius: ${({ isOpen }) =>
            isOpen
                ? `${BORDER_RADIUS}px ${BORDER_RADIUS}px 0 0`
                : `${BORDER_RADIUS}px`};

        ${({ disabled, theme }) =>
            disabled &&
            css`
                cursor: default;
                ${StyledPlaceholder} {
                    color: ${theme.colors.gray[700]};
                }
            `}

        ${StyledCloseIcon} {
            top: ${({ size, isOpen }) => {
                if (isOpen) {
                    return size === 'medium' ? 9 : 4;
                }

                return size === 'medium' ? 8 : 3;
            }}px;
            right: ${({ isOpen }) => (isOpen ? 32 : 31)}px;
        }

        ${StyledArrowIcon} {
            top: ${({ size }) => (size === 'medium' ? 12 : 8)}px;
            right: ${({ isOpen }) => (isOpen ? 12 : 11)}px;
        }

        ${StyledToggleContent} {
            padding-top: ${({ isOpen, size }) =>
                isOpen ? (size === 'medium' ? 8 : 6) : 0}px;
        }

        ${StyledToggleFilter},
        ${StyledChip} {
            height: ${({ size }) =>
                size === 'medium' ? ITEM_HEIGHT : SMALL_ITEM_HEIGHT}px;
            line-height: ${({ size }) =>
                size === 'medium' ? ITEM_HEIGHT + 1 : SMALL_ITEM_HEIGHT + 1}px;
        }

        ${StyledItemsWrapper}:not(:empty) {
            margin-right: ${({ size }) =>
                size === 'medium' ? ITEM_GAP : SMALL_ITEM_GAP}px;
        }
    }
`;
