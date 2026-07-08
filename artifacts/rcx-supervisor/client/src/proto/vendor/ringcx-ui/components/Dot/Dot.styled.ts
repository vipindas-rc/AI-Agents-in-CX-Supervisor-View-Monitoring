import styled from 'styled-components';

import type { IDotProps } from './types';

export const Dot = styled.div<IDotProps>`
    height: 10px;
    width: 10px;
    background-color: ${({ color }) => color};
    border: 1px solid white;
    border-radius: 50%;
    box-sizing: content-box;
`;
