import type { ReactNode } from 'react';

export interface IFormControlProps {
    label?: string;
    name: string;
    error?: boolean;
    disabled?: boolean;
    required?: boolean;
    message?: string;
    errorId?: string;
    leftIcon?: ReactNode;
    children: ReactNode;
}
