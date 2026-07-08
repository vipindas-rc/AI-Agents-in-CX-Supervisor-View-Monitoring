import styled, { css } from 'styled-components';

// local alpha() — avoids pulling @mui (its barrel triggers a Vite circular React interop)
const alpha = (color: string, value: number): string => {
  const c = String(color || '').trim();
  const m = c.match(/^#([0-9a-f]{6})$/i);
  if (m) {
    const n = parseInt(m[1], 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${value})`;
  }
  return c;
};
const styledComponent = styled;

import { GL_CLASSES } from './constants';
import GridList from './GridList';
import type { GridListBaseProps } from './types';

const restoreBackgroundColorFirstCell = css`
    &::before {
        content: '';
        /* First column width */
        width: 30px;
        height: 100%;
        background-color: ${({ theme }) => theme.colors.background};
        position: absolute;
        left: 0;
        top: 0;
    }
`;

export const gridListRowHoverStyles = css<GridListBaseProps>`
    ${({ isCheckboxesOutside }) => css`
        cursor: pointer;
        background-color: ${({ theme }) => theme.colors.gray[50]};
        ${isCheckboxesOutside && restoreBackgroundColorFirstCell}
    `}
`;

export const gridListRowHighlightStyles = css<GridListBaseProps>`
    ${({ isCheckboxesOutside }) => css`
        background-color: ${({ theme }) => alpha(theme.colors.success, 0.1)};
        transition: background-color 0.2s ease-in-out;

        ${isCheckboxesOutside && restoreBackgroundColorFirstCell}
    `}
`;

const onHoverBackground = css<GridListBaseProps>`
    ${({ disableHoverStyles, isCheckboxesOutside }) =>
        !disableHoverStyles &&
        css`
            .${GL_CLASSES.ROW}, .${GL_CLASSES.SUB_ROW} {
                position: relative;

                &:hover,
                &:focus,
                &:focus-visible,
                &:focus-within {
                    ${gridListRowHoverStyles}
                }
            }

            .${GL_CLASSES.ROW_GROUP}:has(
                    > .${GL_CLASSES.SUB_ROW}:is(:hover, :focus, :focus-visible, :focus-within)
                )
                > .${GL_CLASSES.ROW} {
                ${gridListRowHoverStyles}
            }
        `}
}
`;

const checkedStateBackground = css<GridListBaseProps>`
    ${({ disableCheckedStyles, isCheckboxesOutside }) =>
        !disableCheckedStyles &&
        css`
            :is(.${GL_CLASSES.ROW},.${GL_CLASSES.SUB_ROW}):has(input:checked) {
                background-color: ${({ theme }) => theme.colors.select};
                ${isCheckboxesOutside && restoreBackgroundColorFirstCell}
            }

            .${GL_CLASSES.ROW_GROUP} .${GL_CLASSES.ROW}:has(input:checked) {
                background-color: ${({ theme }) => theme.colors.background};
            }
        `}
`;

const rowOpen = css<GridListBaseProps>`
    ${({ disableRowOpenStyles }) =>
        !disableRowOpenStyles &&
        css`
            .${GL_CLASSES.ROW_OPEN} {
                font-weight: ${({ theme }) =>
                    theme.font.gridListHead.fontWeight};
                *:nth-child(1) {
                    font-weight: ${({ theme }) =>
                        theme.font.gridListHead.fontWeight};
                }
            }
        `};
`;

const bordersBetweenSubRows = css<GridListBaseProps>`
    ${({ disableHoverStyles, disableCheckedStyles }) =>
        (!disableHoverStyles || !disableCheckedStyles) &&
        css`
            .${GL_CLASSES.SUB_ROW} {
                &:not(div:last-child) {
                    border-bottom: 1px solid
                        ${({ theme }) => theme.colors.gray[0]};
                }
            }
        `}
`;

const checkboxesOutside = css<GridListBaseProps>`
    ${({ isCheckboxesOutside }) =>
        isCheckboxesOutside &&
        css`
            /* Borders */

            .${GL_CLASSES.HEAD},
                .${GL_CLASSES.ROW},
                .${GL_CLASSES.ROW_GROUP}
                .${GL_CLASSES.ROW}.${GL_CLASSES.ROW_OPEN},
                .${GL_CLASSES.ROW_GROUP}:last-child,
                .${GL_CLASSES.SUB_ROW}:last-child {
                border: none;

                &::after {
                    content: '';
                    border-bottom: 1px solid
                        ${({ theme }) => theme.colors.gray[300]};
                    position: absolute;
                    left: 30px;
                    right: 0;
                    bottom: 0;
                }
            }

            .${GL_CLASSES.EMPTY_ROW} {
                position: relative;
            }

            .${GL_CLASSES.SUB_ROW}:last-child, .${GL_CLASSES.EMPTY_ROW} {
                &::after {
                    content: '';
                    border-bottom: 1px solid
                        ${({ theme }) => theme.colors.gray[300]};
                    position: absolute;
                    left: 30px;
                    right: 0;
                    bottom: 0;
                }
            }

            ${checkboxHoverState}
        `}
`;
const checkboxHoverState = css<GridListBaseProps>`
    ${({
        disableDefaultCheckboxVisibleStyle = false,
        isAnyCheckboxSelected = false,
    }) => {
        if (!disableDefaultCheckboxVisibleStyle) {
            return css`
                &:not(
                        :has(
                            :where(
                                input:checked,
                                input[data-indeterminate='true']
                            )
                        )
                    ) {
                    .${GL_CLASSES.HEAD}:not(:hover) input + svg,
                    .${GL_CLASSES.ROW}:not(:hover) input + svg,
                    .${GL_CLASSES.SUB_ROW}:not(:hover) input + svg {
                        visibility: hidden;
                    }
                }
            `;
        }
        return css`
            .${GL_CLASSES.HEAD}:not(:hover) input + svg,
            .${GL_CLASSES.ROW}:not(:hover) input + svg,
            .${GL_CLASSES.SUB_ROW}:not(:hover) input + svg {
                visibility: ${!isAnyCheckboxSelected && 'hidden'};
            }
        `;
    }}
    &:has(:is(.${GL_CLASSES.ROW}:hover, .${GL_CLASSES.SUB_ROW}:hover))
        .${GL_CLASSES.HEAD}
        input
        + svg {
        visibility: visible;
    }

    .${GL_CLASSES.ROW_GROUP}:has(.${GL_CLASSES.SUB_ROW}:hover)
        > .${GL_CLASSES.ROW}
        input
        + svg {
        visibility: visible;
    }
`;

const rowArrowInsideTable = css<GridListBaseProps>`
    .${GL_CLASSES.ROW} {
        & > svg {
            margin-top: 0;
            grid-column: 2;
        }
    }
`;

const resetStyles = css<GridListBaseProps>`
    .${GL_CLASSES.HEAD}.${GL_CLASSES.HEAD_GROUPED}, ${GL_CLASSES.ROW} {
        & > div:first-child {
            padding-left: 0;
        }
    }

    .${GL_CLASSES.HEAD_WRAPPER} {
        z-index: 1;
    }

    .${GL_CLASSES.LIST}, .${GL_CLASSES.HEAD_WRAPPER} {
        min-width: 100%;
    }
`;

const emptySubRow = css<GridListBaseProps>`
    .${GL_CLASSES.EMPTY_ROW}:empty {
        display: none;
    }
`;

export const StyledGridListBase = styled(GridList)`
    // angular styles leak fix

    input[type='checkbox'] {
        margin: 0;
    }

    .${GL_CLASSES.ROW}, .${GL_CLASSES.SUB_ROW} {
        &:focus,
        &:focus-visible,
        &:focus-within {
            background-color: ${({ theme }) => theme.colors.gray[50]};
        }
    }

    & {
        ${onHoverBackground}
        ${rowOpen}
        ${bordersBetweenSubRows}
        ${checkedStateBackground}
        ${checkboxesOutside}
        ${rowArrowInsideTable}
        ${resetStyles}
        ${emptySubRow}
    }
`;

export const GridCellWrapper = styledComponent.span.attrs({
    role: 'gridcell',
})``;

export const GridCellDivWrapper = styledComponent.div.attrs({
    role: 'gridcell',
})``;
