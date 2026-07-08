import MenuItem from '@material-ui/core/MenuItem';
import styled from 'styled-components';

import { UNUSED } from '../../../../helpers/usage';
import { Information } from '../../../../icons/Information';
import { DigitalFontIcon } from '../../../DigitalFontIcon';
import { TextEclipse } from '../../../TextEclipse';
import { DROPDOWN_H_PADDING, LIST_ITEM_EDGE_PADDING } from '../../constants';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
export const StyledListItem = styled(
    ({
        listItemHeight,
        isMultiLine,
        ...rest
    }: {
        listItemHeight: number;
        isMultiLine?: boolean;
        [key: string]: any;
    }) => {
        UNUSED(listItemHeight);
        UNUSED(isMultiLine);
        return <MenuItem {...rest} />;
    }
)<{ listItemHeight: number; isMultiLine?: boolean }>`
    && {
        &.Mui-selected {
            background-color: unset;
        }
        font-weight: 500;
        font-size: ${({ theme }) => theme.font.size.base};
        line-height: 16px;
        padding: ${({ isMultiLine }) => (isMultiLine ? '6px' : '11px')}
            ${DROPDOWN_H_PADDING}px;
        height: ${({ listItemHeight, isMultiLine }) =>
            isMultiLine ? 'auto' : `${listItemHeight}px`};
        min-height: ${({ listItemHeight }) => listItemHeight}px;
        white-space: ${({ isMultiLine }) =>
            isMultiLine ? 'normal' : 'nowrap'};
        transition: none;

        &.selected-item,
        &.selected-item:hover,
        &.selected-item:focus {
            color: ${(p) =>
                `var(--menu-item-active-text, ${p.theme.colors.background})`};
            background-color: ${(p) => p.theme.colors.primary};
            & > div:not([disabled])::before {
                display: block;
            }
            & > span {
                color: ${({ theme }) => theme.colors.background};
            }
        }

        &:hover,
        &.hovered-item:not(.selected-item) {
            background-color: ${(p) => p.theme.colors.gray[300]};

            & > div:not([disabled])::before {
                display: block;
            }
        }
        &:first-child {
            margin-top: ${LIST_ITEM_EDGE_PADDING}px;
        }
        &:last-child {
            margin-bottom: ${LIST_ITEM_EDGE_PADDING}px;
        }
    }
`;

export const ListItemIconWrapper = styled.div`
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    width: 100%;
`;

export const ListItemDotVariant = styled.div`
    display: flex;
    gap: 8px;
    align-items: center;
    overflow: hidden;
`;

export const StyledDigitalFontIcon = styled(DigitalFontIcon)`
    margin-left: 4px;
`;

export const DisabledOptionVariant = styled.div`
    width: 100%;
    display: inline-flex;
    justify-content: space-between;
`;

export const DisabledText = styled.span`
    font-size: 12px;
    font-weight: 700;
`;

export const ButtonTextEclipse = styled(TextEclipse)<{ selected: boolean }>`
    color: ${({ theme, selected }) =>
        selected ? theme.colors.gray[0] : theme.colors.primary};
`;

export const Divider = styled.div`
    height: 1px;
    margin: 4px 0;
    width: 100%;
    border-top: 1px solid ${({ theme }) => theme.colors.gray[300]};
`;

export const MultiLineItemWrapper = styled.div`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
    gap: 2px;
`;

export const MultiLineTitle = styled.div`
    font-weight: 500;
    font-size: ${({ theme }) => theme.font.size.base};
    line-height: 16px;
    color: inherit;
`;

export const MultiLineSubtitle = styled.div`
    font-weight: 400;
    font-size: ${({ theme }) => theme.font.size.small};
    line-height: 14px;
    color: inherit;
    opacity: 0.8;
`;

export const TooltipItemWrapper = styled.div`
    display: flex;
    flex-direction: row;
    gap: 8px;
    align-items: center;
    justify-content: space-between;
    width: 100%;
`;

export const TooltipItemText = styled.span`
    flex-grow: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

export const TooltipItemIcon = styled(Information)`
    color: ${({ theme }) => theme.colors.gray[800]};

    .selected-item & {
        color: ${({ theme }) => theme.colors.background};
    }

    &:before {
        font-weight: normal;
    }
`;
