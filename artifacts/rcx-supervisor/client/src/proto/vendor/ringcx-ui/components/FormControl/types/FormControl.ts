import type { ReactNode } from 'react';

import type { IAdornment } from '../../Adornment/types';
import type { TextInputSizes } from '../../Inputs/TextInput/types/TextInput';
import type { IToolTipProps } from '../../Tooltip/types/Tooltip';

interface IFormControl {
    title: ReactNode;
    required?: boolean;
    error: boolean;
    message: string;
    formWidth?: string;
    endAdornment?: Omit<IAdornment, 'legacyMode' | 'offset'>;
    legacyMode?: boolean;
    highlightError?: boolean;
    size?: TextInputSizes;
    dataAid?: string;
    tooltip?: {
        message: string;
        placement?: IToolTipProps['placement'];
    };
    showRequiredAsterisk?: boolean;
    fieldKey?: string;
}

export default IFormControl;
