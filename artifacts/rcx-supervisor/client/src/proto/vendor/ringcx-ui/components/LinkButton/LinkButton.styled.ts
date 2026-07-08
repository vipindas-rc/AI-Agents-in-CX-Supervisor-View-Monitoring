import { Link } from '@material-ui/core';
import styled, { css } from 'styled-components';

import type { LinkIconPositionEnum } from './types/LinkButton';
import { focusVisibleStyles } from '../../helpers/accessibility';
import type { ColorType } from '../../theme/types/colors';

export const StyledIconWrapper = styled.div<{
    iconPosition: LinkIconPositionEnum;
    disabled: boolean;
}>`
    && {
        display: flex;
        align-items: center;
        justify-self: center;

        i {
            font-size: 16px;
        }

        ${({ iconPosition }) =>
            iconPosition === 'right'
                ? css`
                      margin-left: 6px;
                  `
                : css`
                      margin-right: 6px;
                  `};
        ${({ theme, disabled }) =>
            disabled &&
            css`
                color: ${theme.colors.gray[300]};
            `}
    }
`;

export const StyledLabelWrapper = styled.div``;

export const StyledLinkButton = styled(Link)<{
    disabled: boolean;
    color?: keyof ColorType | string;
}>`
    && {
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${({ theme }) => theme.font.size.base};
        font-weight: 500;
        white-space: nowrap;
        letter-spacing: 0.15px;
        color: ${({ color, theme }) => {
            const colorValue =
                color && color in theme.colors
                    ? theme.colors[color as keyof ColorType]
                    : theme.colors.primary;
            return `var(--link-color, ${colorValue})`;
        }};

        ${({ theme, disabled, color }) => {
            if (disabled) {
                return css`
                    color: ${theme.colors.gray[400]};
                    cursor: default;
                    text-decoration: none;
                    outline: none;
                    pointer-events: none;
                `;
            }
            const colorValue =
                color && color in theme.colors
                    ? theme.colors[color as keyof ColorType]
                    : theme.colors.primary;
            return css`
                &:hover,
                &:active,
                &:focus {
                    cursor: pointer;
                    color: var(--link-button-hover, ${colorValue});
                    text-decoration: none;

                    ${StyledLabelWrapper} {
                        text-decoration: underline;
                    }
                }

                ${focusVisibleStyles}
            `;
        }}
    }
`;
