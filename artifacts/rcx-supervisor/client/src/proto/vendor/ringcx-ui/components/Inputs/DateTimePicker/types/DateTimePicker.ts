import type { DateTime, Languages } from '@ringcx/shared';

export interface IDateTimePickerProps {
    onChange: (date: Nullable<DateTime.Instance>) => void;
    value?: Nullable<DateTime.Instance>;
    maxDateTime?: Nullable<DateTime.Instance>;
    minDateTime?: Nullable<DateTime.Instance>;
    format?: string;
    timezone?: string;
    locale?: Languages;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    invalidDateTimeMessage?: string;
    required?: boolean;
    title?: string;
    size?: 'medium' | 'small';
    popperZindex?: number;
    canClear?: boolean;
    legacyHelperText?: boolean;
    shouldDisableDate?: (date?: any) => boolean; // This value is of type unknown in MuiDateTimePicker
    onFocus?: () => void;
    onBlur?: () => void;
    inputId?: string;
    ariaLabelledBy?: string;
}
