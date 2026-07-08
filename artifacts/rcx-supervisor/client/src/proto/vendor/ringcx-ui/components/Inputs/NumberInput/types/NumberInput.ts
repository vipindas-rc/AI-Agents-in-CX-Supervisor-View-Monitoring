import type { ITextInput } from '../../TextInput/types';

export interface INumberInput extends Omit<ITextInput, 'onChange'> {
    onChange(value: string): void;
    min?: number;
    max?: number;
}
