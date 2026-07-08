import styled, { css } from 'styled-components';

import { NAV_LAYOUT_HORIZONTAL } from '../../constant';
import type { ISideNav } from '../../types';

export const NavGroupsWrapper = styled.div<{ layout?: ISideNav['layout'] }>`
    ${({ layout }) => {
        if (layout === NAV_LAYOUT_HORIZONTAL) {
            return css`
                display: flex;
            `;
        }

        return '';
    }}
`;

export const NavGroupsContainer = styled.div<{ layout?: ISideNav['layout'] }>`
    ${({ layout }) => {
        if (layout === NAV_LAYOUT_HORIZONTAL) {
            return css`
                overflow-x: auto;
                display: flex;
            `;
        }

        return;
    }}
`;
