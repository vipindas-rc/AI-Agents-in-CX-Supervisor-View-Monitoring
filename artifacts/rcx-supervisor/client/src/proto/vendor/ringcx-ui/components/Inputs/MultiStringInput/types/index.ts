import type { MultiInputProps } from '../../MultiInput';

export type MultiStringInputProps = {
    title?: string;
    delimiters: string[];
    maxChips?: number;
    maxHeight?: string;
    required?: boolean;
    requiredMessage?: string;
    legacyMode?: boolean;
    helpMessage?: string;
    onChange(values: string[], hasError: boolean): void;
    onError?(error: MultiStringInputError): void;
} & Omit<MultiInputProps, 'renderInput' | 'onChange' | 'onError'>;

export type MultiStringInputError = {
    isEmpty: boolean;
    invalidValues: string[];
};
