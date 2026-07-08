import styled, { css } from 'styled-components';

import { getActiveLinkStyled, getMenuItemStyles } from './mixins';
import { Arrow } from '../../../../icons';

export const StyledMenuItemLink = styled.a<{ isActive: boolean }>`
    ${({ isActive }) => isActive && getActiveLinkStyled};
`;

export const StyledMenuSubItemLink = styled(StyledMenuItemLink)`
    && {
        padding-left: 28px;
    }
`;

export const StyledMenuItemLinkWrapper = styled.div<{ isActive: boolean }>`
    a {
        ${({ isActive }) => isActive && getActiveLinkStyled};
    }
`;

export const StyledMenuSubItemLinkWrapper = styled(StyledMenuItemLinkWrapper)`
    a {
        padding-left: 28px;
    }
`;

export const StyledArrow = styled(Arrow)``;

export const StyledMenuLabel = styled.div`
    ${getMenuItemStyles};
    padding-left: 28px;

    ${StyledArrow} {
        width: 11px;
        height: 11px;
        position: absolute;
        left: 9px;
        top: 9px;
    }
`;

export const StyledAccordion = styled.div`
    transition: all 0.5s;
    transform: translate3d(0, 30px, 0);
    max-height: 0;
    opacity: 0;
    overflow: hidden;
`;

export const StyledAccordionContainer = styled.div<{
    isOpen: boolean;
}>`
    ${({ isOpen }) =>
        isOpen &&
        css`
            ${StyledAccordion} {
                transform: translate3d(0, 0, 0);
                max-height: 100rem;
                opacity: 1;
            }

            ${StyledMenuLabel} {
                font-weight: 500;
                letter-spacing: 0.15px;
            }
        `}
`;
