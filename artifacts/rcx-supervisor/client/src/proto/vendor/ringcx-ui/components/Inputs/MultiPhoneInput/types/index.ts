import type { MultiInputProps } from '../../MultiInput';

export type MultiPhoneInputProps = {
    title?: string;
    delimiters: string[];
    maxChips?: number;
    required?: boolean;
    requiredMessage?: string;
    errorMessage?: string;
    legacyMode?: boolean;
    helpMessage?: string;
    allowShortNumbers?: boolean;
    allowE164Format?: boolean;
    onChange(values: string[], hasError: boolean): void;
    onError?(error: MultiPhoneInputError): void;
    ariaLabelText?: string;
} & Omit<MultiInputProps, 'renderInput' | 'onChange' | 'onError'>;

export type MultiPhoneInputError = {
    isEmpty: boolean;
    isInvalid: boolean;
    invalidValues: string[];
};
