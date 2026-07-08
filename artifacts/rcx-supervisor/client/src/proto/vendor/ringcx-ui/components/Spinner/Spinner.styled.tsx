import styled, { css } from 'styled-components';

import type { ISpinnerProps } from './types';

export const Spinner = styled.div<ISpinnerProps>`
    animation: spin 1s linear infinite;
    padding: 0;
    ${({ size = 'large', theme }) => {
        const dimension = size === 'large' ? '40px' : '22px';
        const borderWidth = size === 'large' ? '6px' : '3px';
        return css`
            width: ${dimension};
            height: ${dimension};
            border: ${borderWidth} solid ${theme.colors.gray[100]};
        `;
    }}
    border-radius: 50%;
    border-left-color: ${({ theme }) => theme.colors.gray[700]};
    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    box-sizing: border-box;
`;
