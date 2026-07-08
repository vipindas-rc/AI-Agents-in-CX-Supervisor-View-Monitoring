import { alpha } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import { StyledBadge } from './components/NavIconBadge';
import type { IStyledTheme } from '../../../../../theme/types/theme';
import TextOverflow from '../../../../TextOverflow';
import { NAV_LAYOUT_HORIZONTAL } from '../../constant';
import type { ISideNav } from '../../types';

interface ISelectableItem extends IStyledTheme {
    selected: boolean;
    viewing: boolean;
    layout: ISideNav['layout'];
}
interface INavItemText {
    useBadge?: boolean;
}

const activeState = ({ theme: { colors } }: IStyledTheme) => {
    return `
        background: ${colors.background};
        color: ${colors.primary};
    `;
};

const viewingState = ({ theme: { colors } }: IStyledTheme) => {
    return `
        background: ${alpha(colors.background, 0.2)};
        color:  ${colors.gray[0]};
    `;
};

export const StyledNavItemText = styled(TextOverflow)<INavItemText>`
    font-size: 14px;
    padding-left: 16px;
    font-weight: 500;
    max-width: calc(100% - ${(props) => (props.useBadge ? '50px' : '0')});
    letter-spacing: 0.15px;
`;

export const StyledNavItem = styled.div<ISelectableItem>`
    border-radius: 20px;
    &&&&& > *:first-child {
        max-height: ${(p) =>
            p.layout === NAV_LAYOUT_HORIZONTAL ? '28px' : '40px'};
        flex: 1;
        display: flex;
        color: ${(p) => p.theme.colors.background};
        cursor: pointer;
        border-radius: 20px;
        padding: ${(p) => (p.layout === NAV_LAYOUT_HORIZONTAL ? '6px' : '8px')};
        font-size: ${(p) =>
            p.layout === NAV_LAYOUT_HORIZONTAL ? '18px' : '24px'};
        line-height: ${(p) =>
            p.layout === NAV_LAYOUT_HORIZONTAL ? '20px' : '24px'};
        text-decoration: none;
        overflow: hidden;

        & > svg {
            flex: 0 0 auto;
        }

        ${(p) => (p.viewing ? viewingState(p) : null)}
        ${(p) => (p.selected ? activeState(p) : null)}

        &:hover, &:focus {
            ${(p) => (!p.selected ? viewingState(p) : null)}
            ${(p) => (p.selected ? activeState(p) : null)}

            text-decoration: none;
        }

        &:focus {
            outline: 2px solid ${(p) => p.theme.colors.primary};
            outline-offset: 2px;
        }

        &:focus:not(:focus-visible) {
            outline: none;
        }
    }
`;

export const StyledNavItemWrapper = styled.div<{
    layout: ISideNav['layout'];
}>`
    margin: 12px 12px 0;
    align-items: center;
    text-align: left;

    .MuiBadge-root {
        flex: 1;
    }

    ${({ layout }) =>
        layout === NAV_LAYOUT_HORIZONTAL &&
        css`
            margin: 4px 16px;
        `}

    ${StyledBadge} {
        ${StyledNavItem} {
            max-width: 130px;
        }
    }
`;

export const IconWrapper = styled.span<{ layout: ISideNav['layout'] }>`
    height: ${(p) => (p.layout === NAV_LAYOUT_HORIZONTAL ? '28px' : '40px')};
    width: ${(p) => (p.layout === NAV_LAYOUT_HORIZONTAL ? '28px' : '40px')};
    margin: ${(p) => (p.layout === NAV_LAYOUT_HORIZONTAL ? '-6px' : '-8px')};
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
`;
