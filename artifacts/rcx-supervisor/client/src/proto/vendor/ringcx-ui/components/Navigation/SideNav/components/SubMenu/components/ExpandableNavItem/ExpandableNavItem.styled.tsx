import { ArrowRightRounded, ArrowDropDownRounded } from '@material-ui/icons';
import styled, { css } from 'styled-components';

import { focusVisibleStyles } from '../../../../../../../helpers/accessibility/accessibility';
import type { IStyledTheme } from '../../../../../../../theme/types/theme';
import { MenuItemStyled } from '../MenuItem/MenuItem.styled';

interface IStyledExpandableNavItem extends IStyledTheme {
    expanded: boolean;
}

export const StyledArrowDropDown = styled(ArrowDropDownRounded)`
    display: inline-block;
    vertical-align: middle;
    pointer-events: none;
`;

export const StyledArrowRightRounded = styled(ArrowRightRounded)`
    display: inline-block;
    vertical-align: middle;
    pointer-events: none;
`;

export const ExpandableHeader = styled.div<
    IStyledExpandableNavItem & { isMoreMenu?: boolean }
>`
    display: flex;
    align-items: center;
    user-select: none;
    cursor: pointer;
    height: 34px;
    line-height: 34px;
    margin: 10px 24px 10px 16px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    font-weight: 400;
    letter-spacing: 0.25px;

    ${({ isMoreMenu }) =>
        isMoreMenu
            ? css`
                  color: ${({ theme }) => theme.colors.gray[800]};
                  text-transform: uppercase;
                  font-weight: 500;
              `
            : css`
                  color: ${({ theme }) => theme.colors.gray[900]};
                  font-weight: 400;
              `};

    &:hover {
        color: ${({ theme }) => theme.colors.primary};
    }

    ${focusVisibleStyles}

    ${StyledArrowDropDown},
    ${StyledArrowRightRounded} {
        position: relative;
        top: -1px;
    }
`;

export const ExpandableSection = styled.span<
    IStyledExpandableNavItem & { isMoreMenu?: boolean }
>`
    display: ${({ expanded }) => (expanded ? 'block' : 'none')};

    & > ${MenuItemStyled} {
        & > *:first-child {
            padding-left: 28px;
        }
    }

    ${ExpandableHeader} + span {
        ${MenuItemStyled} {
            & > *:first-child {
                padding-left: 42px;
            }
        }
    }

    ${({ isMoreMenu }) =>
        isMoreMenu &&
        css`
            ${ExpandableHeader} {
                padding-left: 14px;
            }
        `}
`;

export const StyledExpandableNavItem = styled.span`
    font-weight: 500;

    i {
        font-size: 12px;
        padding-right: 6px;
    }
`;
