import styled from 'styled-components';

import type { ICard } from './types/Card';
import { RESPONSIVE_BREAKPOINT } from '../../constants/app';

const borderColor = '#d6d6d6';
const borderWidth = 1;
const arrowHeight = 12;

export const CardHover = styled.div<ICard>`
    background: ${({ theme }) =>
        `var(--content-background, ${theme.colors.background})`};
    border-radius: 10px;
    border: ${borderWidth}px solid ${borderColor};
    min-height: 90px;
    width: 212px;
    position: relative;
    cursor: ${({ selected }) => (selected ? 'default' : 'pointer')};
    display: flex;
    flex-flow: column;
    z-index: 0;

    &:after {
        box-shadow: 0px 2px 12px 0px rgba(173, 173, 173, 0.5);
        border-radius: 10px;
        content: '';
        opacity: ${({ selected }) => (selected ? '1' : '0')};
        transition: opacity 0.2s ease-out;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    }

    @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
        border-width: 0 0 1px 0;
        width: 100%;
        border-radius: 0;
        margin: 0;

        &:after {
            border-radius: 0;
            box-shadow: none;
        }
    }

    &:hover:after {
        opacity: 1;
    }
`;

export const CardArrow = styled.div<ICard>`
    position: relative;
    flex: 1;
    z-index: 1;

    &:after,
    &:before {
        left: 100%;
        top: 50%;
        border: solid transparent;
        content: ' ';
        height: 0;
        width: 0;
        position: absolute;
        pointer-events: none;

        @media (max-width: ${RESPONSIVE_BREAKPOINT}px) {
            display: none;
        }
    }
    &:before {
        border-color: transparent;
        border-left-color: ${(p) => (p.selected ? borderColor : null)};
        border-width: ${arrowHeight}px;
        margin-top: -${arrowHeight}px;
    }
    &:after {
        border-color: transparent;
        border-left-color: ${(p) =>
            p.selected
                ? `var(--content-background, ${p.theme.colors.background})`
                : null};
        border-width: ${arrowHeight - borderWidth}px;
        margin-top: -${arrowHeight - borderWidth}px;
    }
`;

export const CardContent = styled.div`
    padding: 12px 10px 10px 12px;
    z-index: 2;
`;
