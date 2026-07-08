import styled, { css } from 'styled-components';

export const SegmentsWrapper = styled.div<{ width?: string }>`
    margin: 10px;
    ${({ width }) =>
        width &&
        css`
            width: ${width};
        `}
    display: none;
`;
