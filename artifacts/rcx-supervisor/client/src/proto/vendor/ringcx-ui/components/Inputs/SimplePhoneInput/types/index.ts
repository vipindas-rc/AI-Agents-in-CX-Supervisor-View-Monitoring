import type { ITextInput } from '../../TextInput';

export type SimpleInputError = {
    isInvalid: boolean;
};

export type ISimplePhoneInput = ITextInput & {
    errorMessage?: string;
    requiredMessage?: string;
    onError?: (error: SimpleInputError) => void;
};
