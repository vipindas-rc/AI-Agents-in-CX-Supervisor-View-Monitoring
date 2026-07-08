import { Menu, MenuItem } from '@material-ui/core';
import { withStyles, alpha } from '@material-ui/core/styles';
import styled, { css } from 'styled-components';

import { focusVisibleStyles } from '../../helpers/accessibility';
import { theme } from '../../theme';

export const InlineBlock = styled.div<{
    disableMenu?: boolean;
}>`
    display: inline-block;

    ${({ disableMenu }) =>
        disableMenu &&
        css`
            pointer-events: none;
        `}

    ${focusVisibleStyles}
`;

export const StyledMenu = withStyles({
    paper: {
        backgroundColor: `var(--menu-background, ${theme.colors.background})`,
        boxShadow:
            '0 2px 4px 0 var(--box-shadow-1, rgba(208,208,208,0.5)), 0 2px 12px 0 var(--box-shadow-2, rgba(173,173,173,0.5))',
    },
    list: {
        padding: '10px 0',
        minWidth: '126px',
    },
})(Menu);

export const StyledMenuItem = withStyles({
    root: {
        height: '40px',
        minHeight: '40px',
        padding: '0 16px',
        fontSize: '14px',
        fontWeight: 500,
        letterSpacing: '0.17px',
        lineHeight: '16px',
        color: `var(--primary-text-color, ${theme.colors.gray[900]})`,
        '&:focus, &:hover': {
            backgroundColor: `var(--menu-item-hover, ${theme.colors.gray[200]})`,
            '& .MuiListItemIcon-root, & .MuiListItemText-primary': {
                color: `var(--primary-text-color, ${theme.colors.gray[900]})`,
            },
        },
        '&.Mui-selected,&.Mui-selected:hover': `var(--menu-item-active, ${alpha(
            theme.colors.gray[850],
            0.16
        )})`,
    },
})(MenuItem);
