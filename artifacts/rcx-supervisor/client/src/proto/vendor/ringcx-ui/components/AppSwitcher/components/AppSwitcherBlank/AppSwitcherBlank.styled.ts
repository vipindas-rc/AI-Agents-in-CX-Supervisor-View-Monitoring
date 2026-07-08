import styled from 'styled-components';

import { borderSize, quadroSize, size } from './constants';

export const AppSwitcherGrid = styled.div`
    position: absolute;
    width: ${size}px;
    height: ${size}px;
    background: transparent;
    box-sizing: border-box;

    &::before {
        content: '';
        position: absolute;
        background: transparent;
        border: ${borderSize}px solid white;
        border-left: none;
        border-right: none;
        width: 100%;
        height: ${quadroSize * 3}px;
        top: ${quadroSize}px;
        left: 0;
    }

    &::after {
        content: '';
        position: absolute;
        background: transparent;
        border: ${borderSize}px solid white;
        border-top: none;
        border-bottom: none;
        width: ${quadroSize * 3}px;
        height: 100%;
        left: ${quadroSize}px;
        top: 0;
    }
`;

export const AppSwitcherBlankWrapper = styled.div`
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;

    &:first-child {
        position: relative;
    }
`;
