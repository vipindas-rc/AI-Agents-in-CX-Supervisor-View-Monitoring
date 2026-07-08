import styled, { keyframes } from 'styled-components';

const blinkingCursorAnimation = keyframes`
    50%{
        background-color:transparent;
    }
`;
export const StyledBlinkingCursor = styled.span<{
    color?: string;
    cursorDimension?: string;
    blinkingDuration?: string;
}>`
    position: relative;
    &::after {
        content: '';
        position: absolute;
        top: 1px;
        left: 0;
        width: ${({ cursorDimension }) => cursorDimension ?? '7px'};
        height: 13px;
        background: ${({ theme, color }) => color ?? theme.colors.gray[900]};
        display: inline-block;
        animation-name: ${blinkingCursorAnimation};
        animation-duration: ${({ blinkingDuration }) =>
            blinkingDuration ?? '0.8s'};
        animation-iteration-count: infinite;
    }
`;
