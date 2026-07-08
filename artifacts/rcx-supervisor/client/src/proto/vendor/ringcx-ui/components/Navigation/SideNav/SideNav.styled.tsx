import styled, { css } from 'styled-components';

import { NAV_LAYOUT_VERTICAL } from './constant';
import type { ISideNav } from './types/SideNav';
import { AppGradient } from '../../../theme';

type IStyledNav = Pick<ISideNav, 'expanded'>;

export const StyledNavWrapper = styled.div<{ layout: ISideNav['layout'] }>`
    display: flex;

    ${({ layout }) => {
        if (layout === 'horizontal') {
            return css`
                width: 100%;
            `;
        }

        return css`
            height: 100%;
            min-height: 188px;
        `;
    }}
`;

export const StyledNav = styled(AppGradient)<
    IStyledNav & { showMore?: boolean; layout?: ISideNav['layout'] }
>`
    ${({ layout, expanded, theme }) => {
        if (layout === 'horizontal') {
            return css`
                flex-direction: row;
                width: 100%;
                height: 36px;
            `;
        }

        return css`
            flex-direction: column;
            width: ${expanded
                ? theme.dimensions.sideNavExpanded
                : theme.dimensions.sideNav};
            height: 100%;
        `;
    }}

    z-index: ${({ theme }) => theme.zIndexes.sideNav};

    display: flex;
    position: relative;

    ${({ showMore, layout }) =>
        showMore &&
        layout === NAV_LAYOUT_VERTICAL &&
        css`
            & > div:last-child {
                margin: 12px 0;
            }
        `}
`;
