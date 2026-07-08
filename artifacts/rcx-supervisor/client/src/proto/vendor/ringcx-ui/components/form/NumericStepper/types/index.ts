import type { ControllerRenderProps } from 'react-hook-form';

export interface INumericStepperProps extends ControllerRenderProps {
    label?: string;
    error?: boolean;
    disabled?: boolean;
    required?: boolean;
    message?: string;
    extraInfo?: string;
    minValue?: number;
    maxValue?: number;
    id?: string;
    accessibilityLabels?: {
        decrease: string;
        increase: string;
    };
}
