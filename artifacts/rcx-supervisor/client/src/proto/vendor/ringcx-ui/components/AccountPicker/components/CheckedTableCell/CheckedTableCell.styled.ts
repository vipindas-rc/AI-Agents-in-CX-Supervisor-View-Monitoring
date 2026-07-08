import TableCell from '@material-ui/core/TableCell';
import styled from 'styled-components';

import type { ITableCell } from './types';
import { Tick } from '../../../../icons';

export const StyledCheckedTableCell = styled(TableCell)``;

export const StyledTickIcon = styled(Tick)<ITableCell>`
    display: block;
    width: 16px;
    font-size: 16px;
    line-height: 20px;
    color: ${({ theme, disabled }) =>
        disabled ? theme.colors.gray[700] : theme.colors.primary};
`;
