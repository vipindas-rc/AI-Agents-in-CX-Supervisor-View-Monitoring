import {
    SingleSelect,
    DropDownBorder,
    StyledToggle,
    HyperlinkListItemWrapper,
} from '@ringcx/ui';
import styled from 'styled-components';

import { LIST_ICON_SIZE, TAG_ICON_SIZE } from '../constants';

export const StyledTagBox = styled.div`
    display: inline-flex;
    flex-wrap: wrap;
    max-width: 100%;
    margin-top: 8px;
    [class*='MuiAvatar-colorDefault'] {
        background-color: ${(props) => props.theme.colors.primary};
    }
    .style-tag {
        border-color: rgba(0, 145, 255, 0.3);
    }
    .tag-name {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
    }
    .tag-icon {
        display: flex;
        width: ${TAG_ICON_SIZE}px;
        height: ${TAG_ICON_SIZE}px;
        font-size: ${TAG_ICON_SIZE}px;

        img {
            vertical-align: baseline;
        }
    }

    svg.icon-with-theme,
    svg.icon-with-theme path {
        color: ${({ theme }) => theme.colors.primary};
        fill: currentColor;
    }
`;

export const CRMSearchResultListItemTypedIcon = styled.span`
    width: 21px;
    height: 21px;
    color: ${({ theme }) => theme.colors.primary};
    [class*='MuiAvatar-colorDefault'] {
        background-color: ${({ theme }) => theme.colors.primary};
    }
    .tag-icon {
        width: ${LIST_ICON_SIZE}px;
        height: ${LIST_ICON_SIZE}px;
    }

    svg.icon-with-theme,
    svg.icon-with-theme path {
        color: ${({ theme }) => theme.colors.primary};
        fill: currentColor;
    }
`;

export const CRMSearchDetailHeaderLeftExtra = styled.span`
    color: rgba(43, 43, 43, 0.6);
    font-size: 12px;
    font-weight: 400;
    word-wrap: break-word;
    margin-left: 4px;
`;

export const StyledSingleSelect = styled(SingleSelect)`
    height: 34px;
    margin-bottom: 10px;
    ${DropDownBorder} {
        border: 1px solid ${({ theme }) => theme.colors.gray[300]};
        ${StyledToggle} {
            height: 32px;
        }
    }

    ${HyperlinkListItemWrapper} {
        width: 100%;
        justify-content: space-between;
    }

    & li[role='menuitem'] {
        min-height: ${({ size }) => (size === 'small' ? 'unset' : '')};
    }
`;

export const CRMLoading = styled.div`
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(255, 255, 255, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9;
`;
