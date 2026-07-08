import type { DateTime, Languages } from '@ringcx/shared';

export interface IDatePickerProps {
    onChange: (date: Nullable<DateTime.Instance>) => void;
    value?: Nullable<DateTime.Instance>;
    minDate?: Nullable<DateTime.Instance>;
    maxDate?: Nullable<DateTime.Instance>;
    format?: string;
    timezone?: string;
    locale?: Languages;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    invalidDateMessage?: string;
    required?: boolean;
    title?: string;
    size?: 'medium' | 'small';
    popperZindex?: number;
    canClear?: boolean;
    legacyHelperText?: boolean;
    shouldDisableDate?: (date?: any) => boolean; // This value is of type unknown in MuiDatePicker
    // TODO: Temp flag to force render input poppers using light theme inside the UC+CC Script Preview
    //  Remove this prop when we'll support dark theme for the UC+CC Script Preview
    scriptPreview?: boolean;
}
