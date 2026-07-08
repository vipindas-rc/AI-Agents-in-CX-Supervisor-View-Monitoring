import type { Languages } from '@ringcx/shared';
import type { DateTimeFormatOptions } from 'luxon';

export interface IDatePickerWithTextFieldProps {
    onChange: (TextFieldValue: string) => void;
    defaultValue?: string;
    locale?: Languages;
    format?: DateTimeFormatOptions;
    label?: string;
    required?: boolean;
    placeholder?: string;
    // TODO: Temp flag to force render input poppers using light theme inside the UC+CC Script Preview
    //  Remove this prop when we'll support dark theme for the UC+CC Script Preview
    scriptPreview?: boolean;
}
