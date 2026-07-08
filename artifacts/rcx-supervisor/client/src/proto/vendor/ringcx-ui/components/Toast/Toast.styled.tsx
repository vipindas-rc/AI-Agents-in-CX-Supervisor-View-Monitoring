import type { ComponentType } from 'react';

import Link from '@material-ui/core/Link';
import { alpha } from '@material-ui/core/styles';
import styled, { css, keyframes } from 'styled-components';

import type { IToastProps } from './types';
import { matchTypeToColor } from '../../helpers';
import IconButton from '../IconButton/IconButton';

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

const fadeOut = keyframes`
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
`;

export const StyledLink = styled(({ ...restProps }) => <Link {...restProps} />)`
    && {
        font-size: 14px;
        font-weight: bold;
        margin-right: 16px;
        line-height: 1.15;
        letter-spacing: 0.25px;
        color: ${({ theme }) => theme.colors.gray[0]};
        &:hover {
            text-decoration: underline;
        }
        &:active {
            color: ${({ theme }) => alpha(theme.colors.gray[0], 0.76)};
        }
        &:disabled {
            color: ${({ theme }) => alpha(theme.colors.gray[0], 0.24)};
        }
    }
`;

// TODO: deal with any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StyledIconButton: ComponentType<any> = styled(IconButton)`
    && {
        padding: 0;
        width: 32px;
        height: 32px;
        svg {
            width: 8px;
            height: 8px;
            color: ${({ theme }) => theme.colors.gray[0]};
        }
        &:hover {
            background-color: ${({ theme }) =>
                alpha(theme.colors.gray[900], 0.07)};
            svg {
                color: ${({ theme }) => theme.colors.gray[0]};
            }
        }
    }
`;

export const ToastContainerFixed = styled.div`
    position: fixed;
    top: 60px;
    left: 50%;
    right: auto;
    z-index: ${({ theme }) => theme.zIndexes.toast};
    transform: translateX(-50%);
    display: flex;
    flex-direction: column;
    max-width: 90%;
    @media ${({ theme }) => theme.dimensions.screenCrmIntegration} {
        z-index: ${({ theme }) => theme.zIndexes.sideNav + 1};
    }
    font-family: ${({ theme }) => theme.font.family};
`;

export const ToastRoot = styled.div`
    width: 640px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 8px;
    max-width: 100%;

    &:focus {
        outline: none;
    }
`;

export const ToastBody = styled.div<{
    type: IToastProps['type'];
    delay: number;
    fadeInDuration?: number;
    fadeOutDuration?: number;
    hovered: boolean;
    stayOpen?: boolean;
    showAnimation?: boolean;
}>`
    min-height: 48px;
    box-sizing: border-box;
    background-color: ${({ theme, type }) => matchTypeToColor(theme, type)};
    ${({
        delay,
        fadeInDuration,
        fadeOutDuration,
        hovered,
        stayOpen,
        showAnimation,
    }) => css`
        animation: ${fadeIn} ${showAnimation ? fadeInDuration : 0}ms linear
            ${!hovered &&
            !stayOpen &&
            css`, ${fadeOut} ${fadeOutDuration}ms linear ${
                delay === -1 ? 'infinite' : delay
            }ms`};
    `};
    box-shadow: 0 1px 10px 0
        ${({ theme }) =>
            `var(--box-shadow-1, ${alpha(theme.colors.gray[900], 0.12)})`};
    color: ${({ theme }) => theme.colors.gray[0]};
    display: flex;
    padding: 8px 8px 8px 16px;
    flex-grow: 1;
    border-radius: 4px;
    font-size: 14px;
    font-weight: normal;
    align-items: flex-start;
`;

export const ToastMessage = styled.div`
    padding: 6px 24px 6px 0;
    letter-spacing: 0.25px;
    flex: 3;
    word-break: break-word;
`;

export const ToastActions = styled.div`
    min-height: 28px;
    display: flex;
    align-items: center;
    margin-left: auto;
    button:nth-last-child(2) {
        margin-right: 8px;
    }

    &:focus {
        outline: none;
    }
`;
