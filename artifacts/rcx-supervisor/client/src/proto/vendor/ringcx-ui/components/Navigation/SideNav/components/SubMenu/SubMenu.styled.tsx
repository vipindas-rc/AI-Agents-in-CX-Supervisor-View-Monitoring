import styled, { css } from 'styled-components';

import { SubGroup } from './components/GroupNavItem/GroupNavItem.styled';
import type { ISubMenu } from './types';
import type { IStyledTheme } from '../../../../../theme/types/theme';
import { NAV_LAYOUT_HORIZONTAL } from '../../constant';
import type { ISideNav } from '../../types';

interface IStyledSubMenu
    extends IStyledTheme,
        Pick<
            ISubMenu,
            | 'expanded'
            | 'showSubMenu'
            | 'layout'
            | 'showSubMenuHeader'
            | 'isSalesforceCRMAdminClient'
        > {}

const salesforceCRMAdminStyles = css`
    position: relative;
    border-right: 2px solid ${({ theme }) => theme.colors.gray[100]};
`;

const defaultStyles = css`
    position: absolute;
    box-shadow:
        0 2px 4px 0 rgba(208, 208, 208, 0.5),
        0 2px 12px 0 rgba(173, 173, 173, 0.5);
`;

export const Header = styled.div<Pick<IStyledSubMenu, 'layout'>>`
    position: relative;
    user-select: none;
    white-space: nowrap;
    padding: 20px 24px;
    font-size: 16px;
    line-height: 24px;
    height: 64px;
    box-sizing: border-box;
    font-weight: normal;
    letter-spacing: 0.17px;

    border-bottom: 2px solid ${({ theme }) => theme.colors.gray[100]};

    ${({ layout }) => {
        if (layout === 'horizontal') {
            return css`
                width: 100%;
                height: 40px;
                padding: 8px 24px;
            `;
        }

        return;
    }}
`;

export const StyledSubMenu = styled.div<IStyledSubMenu>`
    display: grid;
    visibility: ${({ showSubMenu }) => (showSubMenu ? 'visible' : 'hidden')};
    z-index: ${({ theme }) => theme.zIndexes.sideNavSub};
    background-color: white;
    ${({ isSalesforceCRMAdminClient }) =>
        isSalesforceCRMAdminClient ? salesforceCRMAdminStyles : defaultStyles}

    ${({
        layout,
        theme,
        expanded,
        showSubMenu,
        showSubMenuHeader,
        isSalesforceCRMAdminClient,
    }) => {
        if (layout === 'horizontal') {
            return css`
                grid-template-rows: ${showSubMenuHeader ? '40px 1fr' : '1fr'};
                width: 100%;
                max-height: ${showSubMenu ? theme.dimensions.subMenu : '0px'};
                transition: height 250ms ease-in-out;
                top: 36px;
                left: 0;
            `;
        }

        return css`
            overflow: hidden;
            grid-template-columns: ${() => theme.dimensions.subMenu};
            grid-template-rows: max-content;
            height: 100%;
            width: ${showSubMenu ? theme.dimensions.subMenu : '0px'};
            transition: width 250ms ease-in-out;
            top: 0;
            left: ${isSalesforceCRMAdminClient
                ? 0
                : expanded
                  ? theme.dimensions.sideNavExpanded
                  : theme.dimensions.sideNav};
            bottom: 0;
        `;
    }}

    ${Header} + ${SubGroup} {
        margin-top: 0;
    }
`;

export const ScrollContainer = styled.div<{ layout: ISideNav['layout'] }>`
    padding-top: ${(p) =>
        p.layout === NAV_LAYOUT_HORIZONTAL ? '2px' : '10px'};
    padding-bottom: ${(p) =>
        p.layout === NAV_LAYOUT_HORIZONTAL ? '4px' : '18px'};
    overflow-y: auto;
`;
