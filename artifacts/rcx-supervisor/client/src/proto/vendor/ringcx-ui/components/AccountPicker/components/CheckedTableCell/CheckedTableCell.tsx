import type { FC } from 'react';

import {
    StyledTickIcon,
    StyledCheckedTableCell,
} from './CheckedTableCell.styled';
import type { ICheckedTableCell } from './types';

const CheckedTableCell: FC<ICheckedTableCell> = ({ checked, disabled }) => (
    <StyledCheckedTableCell>
        {checked && <StyledTickIcon disabled={disabled} />}
    </StyledCheckedTableCell>
);

export default CheckedTableCell;
