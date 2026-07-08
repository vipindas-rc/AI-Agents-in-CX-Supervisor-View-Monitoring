import type { FC, PropsWithChildren } from 'react';

import MuiTableCell from '@material-ui/core/TableCell';

import type { IExtendedTableRow } from './types/TableCell';
import { UNUSED } from '../../../../helpers/usage';

export const TableCell: FC<PropsWithChildren<IExtendedTableRow>> = ({
    isDisabled,
    children,
    ...props
}) => {
    UNUSED(isDisabled);
    return <MuiTableCell {...props}>{children}</MuiTableCell>;
};
