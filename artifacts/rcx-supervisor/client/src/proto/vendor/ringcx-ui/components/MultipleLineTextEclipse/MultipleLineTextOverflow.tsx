import styled from 'styled-components';

export default styled.span<{ lines: number }>`
    display: -webkit-box;
    -webkit-line-clamp: ${({ lines }) => lines};
    -webkit-box-orient: vertical;
    overflow: hidden;
`;
