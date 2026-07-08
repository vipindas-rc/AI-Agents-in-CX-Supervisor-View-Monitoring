import { TableRow } from '@material-ui/core';
import type { TableRowProps } from '@material-ui/core/TableRow';
import styled from 'styled-components';

import { UNUSED } from '../../../../helpers/usage';

interface IStyledTableRow extends TableRowProps {
    isClickable: boolean;
}

export const StyledTableRow = styled(
    ({ isClickable, ...restProps }: IStyledTableRow) => {
        UNUSED(isClickable);
        return <TableRow {...restProps} />;
    }
)`
    height: 39px;
    &:hover {
        background-color: ${(p) =>
            p.isClickable ? p.theme.colors.gray[50] : 'inherit'};
        cursor: ${({ isClickable }) => (isClickable ? 'pointer' : 'inherit')};
    }
`;
