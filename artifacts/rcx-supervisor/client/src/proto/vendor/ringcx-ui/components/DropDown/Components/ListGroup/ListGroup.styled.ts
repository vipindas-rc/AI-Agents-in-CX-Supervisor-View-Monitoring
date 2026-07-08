import styled from 'styled-components';

import { DROPDOWN_H_PADDING, LIST_ITEM_EDGE_PADDING } from '../../constants';

export const StyledListGroup = styled.li<{ listItemHeight: number }>`
    display: flex;
    box-sizing: border-box;
    font-size: 12px;
    font-weight: bold;
    height: 16px;
    letter-spacing: 0.4px;
    line-height: 16px;
    text-transform: uppercase;
    padding: calc((${({ listItemHeight }) => listItemHeight}px - 16px) / 2)
        ${DROPDOWN_H_PADDING}px;
    margin: 0;
    min-height: ${({ listItemHeight }) => listItemHeight}px;
    color: ${(p) => p.theme.colors.gray[700]};
    white-space: nowrap;

    span {
        overflow: hidden;
        text-overflow: ellipsis;
    }
    &:first-child {
        margin-top: ${LIST_ITEM_EDGE_PADDING}px;
    }
    &:last-child {
        margin-bottom: ${LIST_ITEM_EDGE_PADDING}px;
    }
`;
