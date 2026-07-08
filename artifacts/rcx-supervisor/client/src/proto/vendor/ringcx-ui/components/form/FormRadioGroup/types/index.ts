import type { ControllerRenderProps } from 'react-hook-form';

export type FormRadioGroupProps = ControllerRenderProps & {
    name: string;
    options: RadioGroupOption[];
    orientation?: 'row' | 'column';
    disabled?: boolean;
};

export type RadioGroupOption = {
    label: string;
    value: string;
};
