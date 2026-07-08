import type { ReactNode, SyntheticEvent } from 'react';

import type TextInputType from './TextInputType';
import type { IAdornment } from '../../../Adornment/types';
import type { IToolTipProps } from '../../../Tooltip/types/Tooltip';

export type TextInputSizes = 'medium' | 'small';

interface ITextInput {
    value: string;
    placeholder?: string;
    disabled?: boolean;
    size?: TextInputSizes;
    type?: TextInputType;
    title?: string;
    error?: boolean;
    message?: string;
    required?: boolean;
    autoFocus?: boolean;
    autoSelect?: boolean;
    autoComplete?: string;
    units?: string | null;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    maxLength?: number;
    endAdornment?: Omit<IAdornment, 'legacyMode' | 'offset'>;
    legacyMode?: boolean;
    highlightError?: boolean;
    onChange?(value: string): void;
    onMaskedChange?(value: SyntheticEvent): void;
    onBlur?(value: string): void;
    onFocus?(value?: SyntheticEvent): void;
    dataAid?: string;
    fieldNameTooltip?: {
        message: string;
        placement?: IToolTipProps['placement'];
    };
    min?: number;
    max?: number;
    'data-aid'?: string;
    showRequiredAsterisk?: boolean;
    ariaLabel?: string;
    fieldKey?: string;
}

export default ITextInput;
