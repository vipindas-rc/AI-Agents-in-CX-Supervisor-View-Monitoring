import styled from 'styled-components';

import type { IVirtualScrollStyled } from './types';

export const VirtualScrollStyled = styled.div<IVirtualScrollStyled>`
    overflow: auto;
    width: ${(p) => (p.width ? `${p.width}px` : '100%')};
    // To fix overflow of parent scrollbar  and paddings.
    height: ${(p) => (p.height ? `${p.height}px` : '100%')};
    outline: none;
`;
