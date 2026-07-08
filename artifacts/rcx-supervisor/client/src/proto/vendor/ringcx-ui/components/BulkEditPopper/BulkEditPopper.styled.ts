import styled from 'styled-components';

import { SELECTED_ITEMS_MAX_WIDTH } from './constants';
import Popper from '../Popper';
import type { IPopper } from '../Popper/types/Popper';

const selectedItemsMaxWidth = `${SELECTED_ITEMS_MAX_WIDTH}px`;

export const StyledPopper = styled(Popper)<IPopper>`
    && {
        width: 320px;
        max-width: 320px;
        max-height: 322px;
        padding: 16px;
        word-break: break-word;
        z-index: 3;
    }
`;

export const StyledPopperItem = styled.p`
    color: ${(p) => p.theme.colors.gray[900]};
    font-size: ${({ theme }) => theme.font.size.base};
    font-weight: normal;
    letter-spacing: 0.25px;
    line-height: 20px;
    margin: 0 0 10px;
    &:last-child {
        margin-bottom: 0;
    }
`;

export const Counter = styled.button`
    outline: none;
    cursor: pointer;
    height: 26px;
    border: none;
    box-shadow: none;
    border-radius: 2px;
    padding: 5px;
    background-color: ${(p) => p.theme.colors.gray[50]};
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.4px;
    line-height: 16px;
    &:hover:not(:disabled) {
        background-color: ${(p) => p.theme.colors.gray[200]};
    }
    &:disabled,
    &:disabled:hover {
        color: ${(p) => p.theme.colors.gray[500]};
        cursor: default;
    }
`;

export const BulkEditPopperWrapper = styled.span`
    position: relative;
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    cursor: default;
    height: 26px;
`;

export const SelectedItems = styled.span<{ disabled?: boolean }>`
    display: inline-block;
    cursor: default;
    text-align: left;
    color: ${({ theme, disabled }) => theme.colors.gray[disabled ? 500 : 900]};
    line-height: 1.6;
    vertical-align: middle;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: ${selectedItemsMaxWidth};
    margin-right: 5px;
`;
