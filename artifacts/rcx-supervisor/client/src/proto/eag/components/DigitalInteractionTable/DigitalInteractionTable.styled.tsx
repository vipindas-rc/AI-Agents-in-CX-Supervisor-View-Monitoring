import { GridList, GL_CLASSES } from '@ringcx/ui';
import styled from 'styled-components';

import {
    SupervisorListHoverMenu,
    SupervisorRowWrapper,
    InformationHoverMenu,
} from '../../containers/SupervisorAgentList/SupervisorAgentList.styled';
import type { ISupervisorTableCol } from '../../containers/SupervisorAgentList/types/SupervisorAgentList';

const glListWidth = () => {
    const width =
        document.getElementsByClassName(`${GL_CLASSES.HEAD_WRAPPER}`)[0]
            ?.scrollWidth || 1535;
    return `${width}px`;
};

export const StyledDigitalInteractionTable = styled<any>(GridList)`
    .${GL_CLASSES.HEAD}, ${SupervisorRowWrapper} {
        display: grid;
        padding: 0 100px 0 24px;
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

        > div {
            overflow: hidden;
            text-overflow: ellipsis;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            white-space: normal;
        }
    }

    .${GL_CLASSES.LIST} {
        border-bottom: ${({ theme }) => `1px solid ${theme.colors.gray[300]}`};
        box-shadow: inset -50px 0px 30px -40px rgb(0 0 0 / 3%);
        margin-bottom: 0;
    }

    .${GL_CLASSES.HEAD_WRAPPER} {
        z-index: 20;
        box-shadow: inset -50px 0px 30px -40px rgb(0 0 0 / 3%);
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
        }
    }

    .${GL_CLASSES.ROW} {
        grid-template-columns: [content] 100% [hover] 0;
        height: 38px;

        ${SupervisorRowWrapper} {
            > div {
                height: 100%;
                line-height: 36px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
        }

        &:hover {
            ${SupervisorRowWrapper}:not(.disabled) {
                background: ${({ theme }) => theme.colors.gray[50]};
            }

            ${SupervisorListHoverMenu} {
                opacity: 1;
                pointer-events: auto;
            }

            ${InformationHoverMenu} {
                opacity: 1;
                pointer-events: auto;
            }
        }
    }

    span.grid-list-link {
        color: ${({ theme }) => theme.colors.primary};
        padding: 10px;
        cursor: pointer;
        font-weight: 500;

        &:hover {
            text-decoration: underline;
        }
    }
`;

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

export const InteractiveStoryBookButtons = styled.div`
    display: flex;
    flex-wrap: wrap;
    justify-content: left;
    margin-top: 10px;
    margin-bottom: 50px;
    gap: 10px;
`;
export const ChannelText = styled.div`
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;
