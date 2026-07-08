import styled, { css } from 'styled-components';

import {
    CLOSE_ICON_SIZE,
    COUNTER_WIDTH,
    DROPDOWN_H_PADDING,
    ICON_LEFT_MARGIN,
    ICON_PADDING,
    ITEM_GAP,
    ITEM_MARGIN_RIGHT,
    SMALL_ITEM_GAP,
    TOGGLE_BORDER,
    TOGGLE_ICON_SIZE,
    TOGGLE_MAX_HEIGHT,
} from '../../../../../constants';
import type { DropDownSizes } from '../../../../../types';

export const ToggleContent = styled.div<{
    isOpen: boolean;
    hiddenCount?: number;
    enableClearButton: boolean;
}>`
    box-sizing: content-box;
    display: flex;
    align-items: center;
    flex-grow: 1;

    width: 100%;
    max-width: calc(
        100% -
            ${({ enableClearButton }) =>
                (enableClearButton ? CLOSE_ICON_SIZE + ICON_PADDING : 0) +
                TOGGLE_ICON_SIZE +
                DROPDOWN_H_PADDING +
                ICON_LEFT_MARGIN -
                TOGGLE_BORDER}px
    );
    ${({ isOpen, hiddenCount, enableClearButton }) =>
        (isOpen || (hiddenCount && hiddenCount > 0)) &&
        css`
            padding-right: ${ITEM_MARGIN_RIGHT +
            COUNTER_WIDTH +
            (isOpen && enableClearButton
                ? CLOSE_ICON_SIZE + ICON_PADDING
                : 0)}px;
        `};
    padding-left: ${({ isOpen }) =>
        isOpen ? DROPDOWN_H_PADDING : DROPDOWN_H_PADDING - TOGGLE_BORDER}px;

    max-height: ${TOGGLE_MAX_HEIGHT}px;
    overflow: hidden;

    ${({ isOpen }) => {
        if (isOpen) {
            return css`
                overflow-y: auto;
                flex-wrap: wrap;
                align-self: baseline;
            `;
        } else {
            return css`
                position: absolute;
                box-sizing: border-box;
            `;
        }
    }}
`;

export const ItemsWrapper = styled.div<{ size: DropDownSizes }>`
    display: flex;
    width: 100%;
    align-items: center;
    gap: ${({ size }) => (size === 'medium' ? ITEM_GAP : SMALL_ITEM_GAP)}px;
`;

export const StyledCounter = styled.span<{ disabled: boolean }>`
    flex-grow: 1;
    font-size: 14px;
    font-weight: 500;
    height: 16px;
    line-height: 16px;
    white-space: nowrap;
    color: ${({ disabled, theme }) =>
        disabled ? theme.colors.gray[400] : theme.colors.primary};
`;
