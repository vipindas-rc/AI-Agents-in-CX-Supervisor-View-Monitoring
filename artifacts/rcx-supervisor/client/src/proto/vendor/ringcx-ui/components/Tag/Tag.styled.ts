import styled, { css } from 'styled-components';

import { TagColorScheme } from './constants';
import type { ITagProps } from './types';
import { focusVisibleStyles } from '../../helpers/accessibility';
import { Close } from '../../icons';

const tagFocusVisibleStyles = css`
    ${focusVisibleStyles}

    &:focus-visible {
        outline-offset: -2px;
        border-radius: 2px;
    }
`;

export const TagText = styled.div`
    line-height: 16px;
    letter-spacing: 0.4px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: inherit;
    padding: 2px 4px;
    font-family: ${({ theme }) => theme.font.family};

    ${tagFocusVisibleStyles}
`;

export const TagCloseButton = styled(Close)`
    padding: 6px;
    font-size: 20px;
    color: inherit;
    box-sizing: border-box;

    ${tagFocusVisibleStyles}
`;

export const AlertIconWrapper = styled.div`
    display: flex;
    align-items: center;
    padding: 0px 4px;
`;

export const TagBorder = styled.div<
    Pick<ITagProps, 'color' | 'disabled' | 'bordered' | 'eclipsable'> & {
        clickable?: boolean;
        closable?: boolean;
    }
>`
    display: inline-flex;
    align-items: center;
    border-radius: 2px;
    position: relative;
    border: none;

    ${({ eclipsable }) =>
        eclipsable &&
        css`
            overflow: hidden;
        `}

    // it helps us control border easily when the tag component is inside some other element
    // for example, the tag is placed inside of some table row and you need to set border when the row is hovered
    &::before {
        content: '';
        display: none;
        position: absolute;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        border: 1px solid ${({ color }) => TagColorScheme[color].border};
        border-radius: 2px;
        pointer-events: none;
        z-index: 0;
    }

    ${({ color, bordered }) => {
        const { background, text } = TagColorScheme[color];

        let borderStyles = css``;
        if (bordered === undefined) {
            borderStyles = css`
                &:not([disabled]):hover::before {
                    display: block;
                }
            `;
        } else if (bordered) {
            borderStyles = css`
                &::before {
                    display: block;
                }
            `;
        }

        return css`
            color: ${text};
            background-color: ${background};

            ${borderStyles};
        `;
    }}

    ${({ disabled }) =>
        disabled &&
        css`
            opacity: 50%;
        `}

    ${({ clickable, disabled }) => {
        if (disabled || !clickable) {
            return;
        }

        return css`
            cursor: pointer;

            &:active {
                opacity: 80%;
            }
        `;
    }}

    ${({ closable, disabled, color, theme }) => {
        if (disabled || !closable) {
            return;
        }

        const { text } = TagColorScheme[color];

        return css`
            ${TagCloseButton} {
                &:hover {
                    background-color: ${text};
                    color: ${theme.colors.gray[0]};
                    cursor: pointer;
                }
            }
        `;
    }}
`;
