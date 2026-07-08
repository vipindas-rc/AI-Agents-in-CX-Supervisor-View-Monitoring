import type { ReactNode } from 'react';

import type { CheckboxProps } from '@material-ui/core/Checkbox';

import type { IAdornment } from '../../Adornment/types';
import type { IInputSize } from '../../constants/types';

export interface ICheckboxProps
    extends Omit<CheckboxProps, 'size'>,
        IInputSize {
    label?: ReactNode;
    endAdornment?: Omit<IAdornment, 'legacyMode' | 'offset'>;
    dataAid?: string;
}
