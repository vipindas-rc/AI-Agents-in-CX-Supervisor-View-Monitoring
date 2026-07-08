import type { ReactNode } from 'react';

import type { i18n } from 'i18next';
export enum NumericStepperSizes {
    MEDIUM = 'medium',
    SMALL = 'small',
}

export interface INumericStepper {
    title?: ReactNode;
    value: number;
    minValue?: number;
    maxValue?: number;
    disabled?: boolean;
    className?: string;
    size?: NumericStepperSizes;
    onChange(value: number): void;
    error?: boolean;
    message?: string;
    required?: boolean;
    min?: number;
    max?: number;
    extraInfo?: string;
    i18n?: i18n;
}
