import styled from 'styled-components';

import type { ITableCell } from '../../../components/CheckedTableCell/types';

export const StyledColoredTableCell = styled.span<ITableCell>`
    color: ${({ theme, disabled }) =>
        disabled ? theme.colors.gray[600] : theme.font.color};
`;
