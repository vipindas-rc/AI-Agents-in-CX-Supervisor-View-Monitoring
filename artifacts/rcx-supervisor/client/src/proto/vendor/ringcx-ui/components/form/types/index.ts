import type { ReactNode } from 'react';

import type { i18n } from 'i18next';
import type { ControllerRenderProps } from 'react-hook-form';

export interface IInputProps extends ControllerRenderProps {
    label?: string;
    error?: boolean;
    disabled?: boolean;
    required?: boolean;
    message?: string;
    leftIcon?: ReactNode;
    rightIcon?: ReactNode;
    tooltipIcon?: {
        message: string;
        icon: ReactNode;
    };
    placeholder?: string;
    type?: string;
    maxLength?: number;
    dataAid?: string;
    i18n?: i18n;
}
