import styled, { keyframes } from 'styled-components';

import type { ISkeleton } from './types';

const wave = keyframes`
  0% {
        transform: translate3d(-100%, 0, 0);
  }
  100% {
      transform: translate3d(100%, 0, 0);
  }
`;
export const SkeletonBase = styled.div<ISkeleton>`
    position: relative;
    overflow: hidden;
    width: ${({ width }) => (width ? `${width}px` : `100%`)};
    ${({ height }) => height && `height: ${height}px;`}
    ${({ variant, border }) => {
        if (!border) {
            return;
        }
        return variant === 'circle'
            ? `border-radius: 50%;`
            : `border-radius: 4px;`;
    }}
    ${({ fill, theme }) =>
        fill === 'dark'
            ? `background: ${theme.colors.gray[100]};`
            : `background: ${theme.colors.gray[50]};`}
`;
export const SkeletonAnimation = styled.div<{ fill: string }>`
    &::after {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: ${({ fill, theme }) =>
            fill === 'dark'
                ? `linear-gradient(90deg, ${theme.colors.gray[100]}, ${theme.colors.gray[50]}, ${theme.colors.gray[100]});`
                : `linear-gradient(90deg, ${theme.colors.gray[50]}, ${theme.colors.gray[100]}, ${theme.colors.gray[50]});`}
        animation: ${wave} 2s ease-in-out infinite;
        // only this solution help with vertical stripe issue https://gist.github.com/ayamflow/b602ab436ac9f05660d9c15190f4fd7b
        -webkit-mask-image: -webkit-radial-gradient(white, black);
    }
`;
