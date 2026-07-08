import TableCell from '@material-ui/core/TableCell';
import styled from 'styled-components';

import { CellPadding } from '../common/CellPadding.styled';
import { StyledCheckboxCell } from '../TableCell';

const headerCellPadding = `
    && {
        padding-top: 4px;
        padding-bottom: 10px;
    }
`;

export const StyledHeadCell = styled(TableCell)`
    ${headerCellPadding}
    ${CellPadding}
    && {
        color: ${({ theme }) => theme.colors.gray[700]};
    }
`;

export const StyledCheckboxHeadCell = styled(StyledCheckboxCell)`
    ${headerCellPadding}
`;
