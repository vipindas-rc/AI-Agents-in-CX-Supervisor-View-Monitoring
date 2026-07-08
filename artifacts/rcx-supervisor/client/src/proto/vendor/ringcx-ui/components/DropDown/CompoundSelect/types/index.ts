import type { ITextInput } from '../../../Inputs/TextInput';
import type { ISingleSelectProps } from '../../types';

export type CompoundSelectProps = Omit<
    ISingleSelectProps,
    'error' | 'required'
> & {
    id: string;
    infoText?: string;
    requiredTitle?: boolean;
    error?: boolean;
    errorMessage?: string;
    dropdownError?: boolean;
    inputPosition?: 'left' | 'right';
    showInputWhenDropdownOpen?: boolean;
    textInputProps?: ITextInput;
    handleDropdownChange: (id: string) => void;
    dropdownWidth?: string;
};
