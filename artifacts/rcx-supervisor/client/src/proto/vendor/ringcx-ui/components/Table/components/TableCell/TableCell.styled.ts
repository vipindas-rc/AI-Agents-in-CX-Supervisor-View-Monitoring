import styled from 'styled-components';

import { TableCell } from './TableCell';
import { CellPadding } from '../common/CellPadding.styled';
import { TableCheckbox } from '../TableCheckbox.styled';

export const StyledTableCell = styled(TableCell)`
    && {
        padding-right: 40px;
        color: ${({ isDisabled, theme }) =>
            isDisabled ? theme.colors.gray[400] : null};

        ${CellPadding}
    }
`;

export const StyledCheckboxCell = styled(TableCell)`
    && {
        padding-right: 12px;
        padding-left: 8px;
        width: 16px;

        ${TableCheckbox} {
            padding: 0;
        }
    }
`;
