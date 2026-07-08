import type { HTMLAttributes } from 'react';

import styled, { css } from 'styled-components';

interface StyledIconWrapperProps extends HTMLAttributes<HTMLSpanElement> {
    size: 'small' | 'medium';
    legacyMode: boolean;
    inline: boolean;
    leftMargin?: number;
    tooltipWidth?: string;
}

export const StyledIconWrapper = styled.span.withConfig({
    shouldForwardProp: (prop) =>
        ![
            'size',
            'legacyMode',
            'inline',
            'leftMargin',
            'tooltipWidth',
        ].includes(prop),
})<StyledIconWrapperProps>`
    ${({ legacyMode, size, leftMargin, inline }) => {
        if (legacyMode) {
            return css`
                padding: 5px 5px 5px 8px;
                &:hover {
                    cursor: help;
                }
                .icon-information {
                    padding: 0;
                }
            `;
        }

        if (inline) {
            return css`
                display: inline-block;
                cursor: default;
                vertical-align: middle;
                font-size: ${size === 'small' ? 16 : 20}px;
                margin-left: 8px;
                box-sizing: border-box;
            `;
        }

        return css`
            height: ${size === 'small' ? 32 : 40}px;
            margin-left: ${leftMargin ? leftMargin : 16}px;
            margin-right: 8px;
            display: flex;
            justify-content: center;
            align-items: center;
            font-size: ${size === 'small' ? 16 : 20}px;
            box-sizing: border-box;
        `;
    }}

    &:focus > i,
    &:focus > svg {
        outline: 2px solid var(--brand-primary);
        outline-offset: 2px;
        border-radius: 4px;
    }

    ${({ tooltipWidth }) =>
        tooltipWidth &&
        css`
            & + .MuiTooltip-popper .MuiTooltip-tooltip {
                max-width: ${tooltipWidth};
                width: ${tooltipWidth};
            }
        `}

    i[class^='icon-'] {
        color: ${({ theme }) => theme.colors.gray[700]};
        padding: 0;
        &:before {
            font-weight: normal;
        }
        &:hover {
            color: ${({ theme }) => theme.colors.gray[900]};
        }
    }
`;
