import type { IInputProps } from '../../types';

export interface IPhoneInputProps extends IInputProps {
    setValue: (name: string, value: string) => void;
    forceParse?: boolean;
}
