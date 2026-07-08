import { useState, useCallback } from 'react';

import type { DeprecatedThemeOptions } from '@mui/material';
import { TextField, createTheme } from '@mui/material';
import { ThemeProvider, adaptV4Theme } from '@mui/material/styles';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DateTime, Languages } from '@ringcx/shared';

import { StyledPopper } from './DatePickerWithTextField.styled';
import type { IDatePickerWithTextFieldProps } from './types';
import { getBrandId, getThemeByBrandId } from '../../../theme/theme';
import { StyledFormControlTheme } from '../../FormControl/FormControlTheme.styled';

const {
    PRESET: { DATE_SHORT },
} = DateTime;

const DatePickerWithTextField = ({
    onChange,
    defaultValue = '',
    locale = Languages.EN_US,
    required = false,
    format = DATE_SHORT,
    label,
    placeholder = '',
    scriptPreview = false,
}: IDatePickerWithTextFieldProps) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [selectedDate, setSelectedDate] = useState<
        Nullable<DateTime.Instance>
    >(DateTimeFromString(defaultValue));
    const [textFieldValue, setTextFieldValue] = useState<string>(defaultValue);

    const brandId = getBrandId();
    const theme = getThemeByBrandId(brandId);

    const handleTextFieldClick = useCallback((event: any) => {
        setAnchorEl(event.currentTarget);
    }, []);

    const handleCalenderClose = useCallback(() => {
        setAnchorEl(null);
    }, []);

    const handleTextChange = useCallback(
        (event: any) => {
            setTextFieldValue(event.target.value);
            setSelectedDate(null);
            onChange(event.target.value);
        },
        [onChange]
    );

    const handleDateChange = useCallback(
        (date: Nullable<DateTime.Instance>) => {
            if (date) {
                setSelectedDate(date);
                const localisedDateString = date.toLocaleString(format);
                setTextFieldValue(localisedDateString);
                onChange(localisedDateString);
                handleCalenderClose();
            }
        },
        [format, handleCalenderClose, onChange]
    );

    return (
        <div>
            <ThemeProvider
                theme={createTheme(
                    adaptV4Theme(theme as DeprecatedThemeOptions)
                )}
            >
                <StyledFormControlTheme>
                    <TextField
                        value={textFieldValue}
                        onChange={handleTextChange}
                        onClick={handleTextFieldClick}
                        label={label}
                        required={required}
                        placeholder={placeholder}
                        fullWidth={true}
                        error={!textFieldValue && required}
                    />
                    <StyledPopper
                        open={Boolean(anchorEl)}
                        anchorEl={anchorEl}
                        onClose={handleCalenderClose}
                        anchorOrigin={{
                            vertical: 'bottom',
                            horizontal: 'left',
                        }}
                        className={scriptPreview ? 'script-element' : ''}
                    >
                        <LocalizationProvider
                            dateAdapter={AdapterLuxon}
                            adapterLocale={locale}
                        >
                            <DateCalendar
                                value={selectedDate}
                                onChange={handleDateChange}
                                autoFocus
                            />
                        </LocalizationProvider>
                    </StyledPopper>
                </StyledFormControlTheme>
            </ThemeProvider>
        </div>
    );
};

export const DateTimeFromString = (value: string) => {
    const dateFormat = DateTime.Instance.parseFormatForOpts(
        DateTime.PRESET.DATE_SHORT
    );
    const dateTimeFormatted =
        dateFormat && DateTime.fromFormat(value, dateFormat);
    const validDateObject =
        dateTimeFormatted && dateTimeFormatted.isValid
            ? dateTimeFormatted
            : null;

    return validDateObject;
};

export default DatePickerWithTextField;
