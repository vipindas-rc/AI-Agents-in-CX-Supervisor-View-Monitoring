import { Fragment } from 'react';

import {
    GridList,
    GL_CLASSES,
    TextOverflow,
    Tooltip,
    focusVisibleInsideOverflowStyles,
} from '@ringcx/ui';
import styled, { css, keyframes } from 'styled-components';

import type { ISupervisorTableCol } from './types/SupervisorAgentList';
import { MAX_INTERACTIONS } from '../../constants/app';

// Blink used to draw the supervisor's eye to interaction rows that were opened
// from the Agents tab "Active interactions" column. Pulses a light grey a few
// times, then settles back to the row's normal background.
const interactionHighlightBlink = keyframes`
    0% { background-color: transparent; }
    25% { background-color: #ececec; }
    50% { background-color: transparent; }
    75% { background-color: #ececec; }
    100% { background-color: transparent; }
`;

const glListWidth = () => {
    const width =
        document.getElementsByClassName(`${GL_CLASSES.HEAD_WRAPPER}`)[0]
            ?.scrollWidth || 2288;
    return `${width}px`;
};

export const SupervisorListHoverMenu = styled.div`
    position: sticky;
    right: 0;
    opacity: 0;

    & > div {
        right: 0;
        top: 0;
        height: 38px;
        padding: 0 16px;
        align-self: center;
        background: ${({ theme }) => theme.colors.gray[50]};
        position: absolute;
        width: max-content;
        line-height: 18px;
        display: flex;

        & > div {
            margin: auto 0 auto 4px;
        }
    }

    &:focus-within {
        opacity: 1;
        pointer-events: auto;
    }
`;

export const InformationHoverMenu = styled(SupervisorListHoverMenu)<{
    isInfoToolTipVisible: boolean;
}>`
    opacity: ${(props) => (props.isInfoToolTipVisible ? 1 : 0)};
    pointer-events: ${(props) =>
        props.isInfoToolTipVisible ? 'auto' : 'none'};

    &:focus-within {
        opacity: 1;
        pointer-events: auto;
    }
`;

export const StyledSupervisorCellWrapper = styled.div``;
export const StyledAgentNameCellWrapper = styled(StyledSupervisorCellWrapper)`
    background-color: ${({ theme }) => theme.colors.gray[0]};
`;

export const SupervisorRowWrapper = styled.div<{
    isCurrentlyMonitoring: boolean;
    isInfoToolTipVisible?: boolean;
    isHighlighted?: boolean;
    isSelected?: boolean;
    alertSeverity?: 'critical' | 'warning' | null;
}>`
    background-color: ${({ theme, isInfoToolTipVisible }) =>
        isInfoToolTipVisible ? theme.colors.gray[50] : theme.colors.gray[0]};

    /* Flagged rows get a thin colored strip on the left edge instead of a
       full-row tint, so they stay noticeable without washing out the row.
       Using an inset box-shadow keeps cell layout/column alignment untouched
       (no extra column, no width change). */
    box-shadow: inset 2px 0 0 0 transparent;

    /* Ease the flagged-state flip so live score crossings fade in/out rather
       than snapping (low-distraction real-time updates). */
    transition:
        background-color 0.5s ease,
        box-shadow 0.5s ease;

    ${({ isHighlighted }) =>
        isHighlighted &&
        css`
            animation: ${interactionHighlightBlink} 0.9s ease-in-out 3;
        `}

    ${({ alertSeverity }) =>
        alertSeverity === 'warning' &&
        css`
            box-shadow: inset 2px 0 0 0 #ed6c02;
        `}

    ${({ alertSeverity }) =>
        alertSeverity === 'critical' &&
        css`
            box-shadow: inset 2px 0 0 0 #d32f2f;
        `}

    ${({ isSelected, theme }) =>
        isSelected &&
        css`
            background-color: ${theme.colors.select};
        `}

    ${({ isCurrentlyMonitoring, theme }) =>
        isCurrentlyMonitoring &&
        css`
            background-color: ${theme.colors.select};

            ${StyledAgentNameCellWrapper} {
                background-color: inherit;

                &::before {
                    content: '|';
                    position: absolute;
                    right: 0;
                    color: ${theme.colors.primary};
                    background-color: ${theme.colors.primary};
                }
            }
        `}
`;

export const StyledSupervisorAgentList = styled<any>(GridList)`
    .${GL_CLASSES.HEAD}, ${SupervisorRowWrapper} {
        display: grid;
        padding: 0 100px 0 0;
        gap: 28px;
        font-size: 13px;

        grid-template-columns: ${({ columns }) =>
            columns.reduce(
                (acc: any, col: ISupervisorTableCol) =>
                    col.maxWidth
                        ? `${acc} [${col.id}] minmax(${col.width}px, ${col.maxWidth}px)`
                        : `${acc} [${col.id}] ${col.width}px`,
                ''
            )};

        > div,
        ${StyledSupervisorCellWrapper} {
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            white-space: normal;

            &:first-child {
                position: sticky;
                padding-left: 24px;
                padding-right: 16px;
                z-index: 10;
                left: 0;
                height: 100%;
                border-right: ${({ theme }) =>
                    `1px solid ${theme.colors.gray[300]}`};
                box-shadow: 140px 0 100px 0 rgb(0 0 0 / 7%);
            }
        }
    }

    .${GL_CLASSES.HEAD_WRAPPER} {
        z-index: 20;
        box-shadow: inset -50px 0px 30px -40px rgb(0 0 0 / 3%);
    }

    .${GL_CLASSES.LIST} {
        border-bottom: ${({ theme }) => `1px solid ${theme.colors.gray[300]}`};
        box-shadow: inset -50px 0 30px -40px rgb(0 0 0 / 3%);
        margin-bottom: 0;
    }

    .${GL_CLASSES.HEAD} {
        top: 0;
        max-width: none;
        background: ${({ theme }) => theme.colors.gray[0]};
        align-items: center;
        user-select: none;

        > div {
            display: flex;
            min-height: 38px;
            max-height: 64px;
            padding: 9px 0;
            font-size: 13px;

            &:first-child {
                background: ${({ theme }) => theme.colors.gray[0]};
                > div {
                    height: 100%;
                }
            }
        }
    }

    .${GL_CLASSES.ROW} {
        grid-template-columns: [content] 100% [hover] 0;
        height: 38px;

        ${SupervisorRowWrapper} {
            ${StyledSupervisorCellWrapper} {
                height: 100%;
                line-height: 36px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        &:hover {
            ${SupervisorRowWrapper} {
                background: ${({ theme }) => theme.colors.gray[50]};

                ${StyledAgentNameCellWrapper} {
                    background: ${({ theme }) => theme.colors.gray[50]};
                }
            }

            ${SupervisorListHoverMenu} {
                opacity: 1;
                pointer-events: auto;
            }
        }
    }

    span.grid-list-link {
        color: ${({ theme }) => theme.colors['primary']};
        padding: 10px;
        cursor: pointer;
        font-weight: 500;

        &:hover {
            text-decoration: underline;
        }
    }
`;

interface GridListLinkProps {
    showAsLink?: boolean;
}

export const StyledGridListLink = styled.span<GridListLinkProps>`
    ${({ showAsLink }) =>
        showAsLink &&
        css`
            color: ${({ theme }) => theme.colors['primary']};
            cursor: pointer;
            ${focusVisibleInsideOverflowStyles}
        `}
    font-weight: 500;
`;

StyledGridListLink.displayName = 'StyledGridListLink';

export const EmptyWrapper = styled.div`
    width: ${glListWidth()};
`;

export const EmptyResult = styled.div`
    color: var(--secondary-text-color);
    font-weight: 700;
    font-style: italic;
    text-align: center;
    line-height: 0;
    height: 80px;
    padding: 40px 0;
    background: var(--content-background);
    position: sticky;
    left: 40vw;
    width: fit-content;
`;

export const ShowIcon = styled.div`
    display: flex;
    align-self: center;
    gap: 5px;
`;
interface SupervisorStateColorProps {
    stateColor: string;
}

export const SupervisorStateColor = styled.div<SupervisorStateColorProps>`
    width: 8px;
    height: 8px;
    margin: auto 0 auto 2px;
    border-radius: 18px;
    background-color: ${({ stateColor }) => stateColor};
`;

export const SupervisorStateText = styled(TextOverflow)`
    width: 100%;
`;

export const ShowState = styled.div`
    display: flex;
    gap: 5px;
`;

export const AgentTypeTag = styled.span<{ variant: 'air' | 'human' }>`
    display: inline-flex;
    align-items: center;
    height: 20px;
    padding: 0 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 600;
    line-height: 20px;
    white-space: nowrap;
    ${({ variant }) =>
        variant === 'air'
            ? css`
                  background-color: #fef0e6;
                  color: #d3720e;
              `
            : css`
                  background-color: #f2f3f5;
                  color: #5c6066;
              `}
`;
export const StyledActiveInteraction = styled.div`
    && {
        display: flex;
        border-radius: 16px;
        align-items: center;
        justify-content: center;
        height: 22px;
        gap: 10px;
        padding-left: 7px;
        padding-right: 7px;
        padding-top: 3px;
        border: 1px solid ${({ theme }) => theme.colors.gray[300]};
        background-color: ${({ theme }) => theme.colors.gray[100]};
        opacity: 1;
        &:hover {
            cursor: pointer;
            border: 1px solid ${({ theme }) => theme.colors.gray[600]};
        }
    }
`;

export const StyledTruncatedInteraction = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 22px;
    width: 15px;
    letter-spacing: 0.4px;
    font-size: 12px;
    font-weight: 500;
    color: ${({ theme }) => theme.colors.gray[700]};
`;
export const StyledActiveInteractionsWrapper = styled.div<{
    isSelfAgent: boolean;
}>`
    display: flex;
    padding-top: 8px;
    gap: 5px;
    ${({ isSelfAgent, theme }) =>
        isSelfAgent &&
        css`
            pointer-events: none;
            color: ${theme.colors.gray[700]};
        `}
`;
export const StyledActiveInteractions = styled(
    // @ts-ignore
    ({ children, onClick, totalInteractions, toolTip }) => {
        if (totalInteractions > MAX_INTERACTIONS) {
            return (
                <Fragment>
                    <Tooltip title={toolTip} placement='bottom'>
                        <StyledActiveInteraction onClick={onClick}>
                            {children}
                        </StyledActiveInteraction>
                    </Tooltip>
                    <StyledTruncatedInteraction>
                        +{totalInteractions - MAX_INTERACTIONS}
                    </StyledTruncatedInteraction>
                </Fragment>
            );
        }
        return (
            <Tooltip title={toolTip} placement='bottom'>
                <StyledActiveInteraction onClick={onClick}>
                    {children}
                </StyledActiveInteraction>
            </Tooltip>
        );
    }
)``;
