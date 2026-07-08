import styled, { css } from 'styled-components';

export const SVG = styled.svg`
    height: ${({ height }) => height || '1em'};

    ${({ width }) =>
        width &&
        css`
            width: ${width};
        `}
`;
