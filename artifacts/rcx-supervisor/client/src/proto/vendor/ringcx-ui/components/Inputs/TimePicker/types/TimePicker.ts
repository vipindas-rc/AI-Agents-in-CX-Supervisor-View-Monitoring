import type { TimeView } from '@mui/x-date-pickers';
import type { DateTime, Languages } from '@ringcx/shared';

type AdditionalOnChangeProps = {
    index?: number;
};

export interface ITimePickerProps {
    onChange: (
        date: Nullable<DateTime.Instance>,
        additionalOnChangeProps?: AdditionalOnChangeProps
    ) => void;
    value?: Nullable<DateTime.Instance>;
    minTime?: Nullable<DateTime.Instance>;
    maxTime?: Nullable<DateTime.Instance>;
    format?: string;
    timezone?: string;
    locale?: Languages;
    placeholder?: string;
    disabled?: boolean;
    error?: boolean;
    helperText?: string;
    invalidTimeMessage?: string;
    required?: boolean;
    title?: string;
    size?: 'medium' | 'small';
    popperZindex?: number;
    canClear?: boolean;
    legacyHelperText?: boolean;
    additionalOnChangeProps?: AdditionalOnChangeProps;
    shouldDisableClock?: (clockValue: number, view: TimeView) => boolean;
    // TODO: Temp flag to force render input poppers using light theme inside the UC+CC Script Preview
    //  Remove this prop when we'll support dark theme for the UC+CC Script Preview
    scriptPreview?: boolean;
}
