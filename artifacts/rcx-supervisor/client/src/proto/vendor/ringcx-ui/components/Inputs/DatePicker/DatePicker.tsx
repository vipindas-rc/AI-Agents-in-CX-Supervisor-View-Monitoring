import type { KeyboardEvent, MouseEvent } from 'react';
import {
    memo,
    useMemo,
    useState,
    useEffect,
    useCallback,
    forwardRef,
} from 'react';

import { IconButton, InputAdornment } from '@material-ui/core';
import type { DeprecatedThemeOptions } from '@mui/material';
import { createTheme } from '@mui/material';
import { ThemeProvider, adaptV4Theme } from '@mui/material/styles';
import type { DateValidationError } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { PickerChangeHandlerContext } from '@mui/x-date-pickers/models';
import { DateTime, Languages } from '@ringcx/shared';
import { useTranslation } from 'react-i18next';

import type { IDatePickerProps } from './types';
import { isEscapeKey } from '../../../helpers/keyboard/keyboard';
import { Calendar, CloseSvg } from '../../../icons';
import { i18next } from '../../../services/translate';
import { getBrandId, getThemeByBrandId } from '../../../theme/theme';
import { StyledFormControlTheme } from '../../FormControl/FormControlTheme.styled';
import { StyledDatePaperWrapper } from '../../Paper/Paper.styled';
import { FOCUS_DELAY_MS } from '../constants';

const {
    DATETIME_FORMAT: { LOCALISED_NUMERIC_DATE },
} = DateTime;

const DatePicker = forwardRef<HTMLDivElement, IDatePickerProps>(
    (
        {
            value = null,
            disabled = false,
            shouldDisableDate = () => false,
            maxDate,
            minDate,
            onChange,
            title = '',
            error = false,
            helperText,
            invalidDateMessage = 'Invalid Date Format',
            required = false,
            size = 'small',
            format = LOCALISED_NUMERIC_DATE,
            timezone,
            locale = Languages.EN_US,
            canClear = false,
            legacyHelperText = false,
            placeholder,
            popperZindex,
            scriptPreview = false,
        },
        ref
    ) => {
        const [isValidDate, setIsValidDate] = useState(true);
        const [selectedDts, setSelectedDts] = useState(value);
        const { t } = useTranslation(undefined, { i18n: i18next });

        const brandId = getBrandId();
        const theme = getThemeByBrandId(brandId);

        const onChangeHandler = useCallback(
            (
                date: any, // This value is coming as unknown from MuiDatePicker
                context: PickerChangeHandlerContext<DateValidationError>
            ) => {
                if (
                    context.validationError &&
                    context.validationError !== null
                ) {
                    setIsValidDate(false);
                }

                if (date && DateTime.isValidDateTime(date)) {
                    onChange(date);
                    setSelectedDts(date);
                } else {
                    onChange(null);
                    setSelectedDts(null);
                }
            },
            [onChange]
        );

        const onOpenHandler = useCallback(() => {
            if (!selectedDts) {
                const newDts = DateTime.now().setZone(timezone);
                setSelectedDts(newDts);
                onChange(newDts);
            }

            requestAnimationFrame(() => {
                setTimeout(() => {
                    const selectors = [
                        '.MuiPickersDay-root.Mui-selected',
                        '.MuiPickersDay-root.MuiPickersDay-today:not(.Mui-disabled)',
                        '.MuiPickersDay-root:not(.Mui-disabled)',
                    ];

                    for (const selector of selectors) {
                        const dateButton = document.querySelector(
                            selector
                        ) as HTMLButtonElement;
                        if (dateButton) {
                            dateButton.focus();
                            if (document.activeElement === dateButton) {
                                break;
                            }
                        }
                    }
                }, FOCUS_DELAY_MS);
            });
        }, [selectedDts, timezone, onChange]);

        const onCloseHandler = useCallback(
            (event?: KeyboardEvent | MouseEvent) => {
                if (event instanceof KeyboardEvent && isEscapeKey(event.key)) {
                    event.stopPropagation();
                }
            },
            []
        );

        useEffect(() => {
            const isValid = value === null || value?.isValid;
            setIsValidDate(isValid);

            const isValidMinDate = !!(
                value &&
                minDate &&
                value.set({ hour: 23, minute: 59, second: 59 }).toMillis() <
                    minDate.set({ hour: 0, minute: 0, second: 0 }).toMillis()
            );
            const isValidMaxDate = !!(
                value &&
                maxDate &&
                value.set({ hour: 0, minute: 0, second: 0 }).toMillis() >
                    maxDate.set({ hour: 23, minute: 59, second: 59 }).toMillis()
            );

            setIsValidDate(!isValidMinDate && !isValidMaxDate);
            setSelectedDts(value);
        }, [value, minDate, maxDate]);

        const handleClearValue = useCallback(() => {
            if (!disabled) {
                setSelectedDts(null);
                onChange(null);
            }
        }, [disabled, onChange]);

        const startAdornment = useMemo(() => {
            return (
                value &&
                canClear && (
                    <InputAdornment position='start'>
                        <IconButton
                            {...{
                                'aria-label': t('ARIA_LABELS.CLEAR_DATE'),
                                disabled,
                                onClick: handleClearValue,
                            }}
                        >
                            <CloseSvg />
                        </IconButton>
                    </InputAdornment>
                )
            );
        }, [disabled, handleClearValue, value, canClear, t]);
        return (
            <ThemeProvider
                theme={createTheme(
                    adaptV4Theme(theme as DeprecatedThemeOptions)
                )}
            >
                <LocalizationProvider
                    dateAdapter={AdapterLuxon}
                    adapterLocale={locale}
                >
                    <StyledFormControlTheme
                        size={size}
                        legacyHelperText={legacyHelperText}
                    >
                        <MuiDatePicker
                            {...{
                                slots: {
                                    openPickerIcon: () => <Calendar />,
                                    layout: (paperProps) => (
                                        <StyledDatePaperWrapper
                                            {...paperProps}
                                        />
                                    ),
                                },
                                disabled,
                                value: selectedDts,
                                onOpen: onOpenHandler,
                                onClose: onCloseHandler,
                                maxDate,
                                minDate,
                                onChange: onChangeHandler,
                                shouldDisableDate,
                                format,
                                timezone,
                                className: scriptPreview
                                    ? 'script-element'
                                    : '',
                                slotProps: {
                                    popper: {
                                        style: {
                                            ...(popperZindex && {
                                                zIndex: popperZindex,
                                            }),
                                        },
                                        className: scriptPreview
                                            ? 'script-element'
                                            : '',
                                        role: 'dialog',
                                        'aria-modal': 'true',
                                        'aria-label': t(
                                            'ARIA_LABELS.DATE_PICKER_CALENDAR'
                                        ),
                                    },
                                    textField: {
                                        variant: 'outlined',
                                        label: title,
                                        inputRef: ref,
                                        required,
                                        fullWidth: true,
                                        error: !isValidDate || error,
                                        helperText: !isValidDate
                                            ? invalidDateMessage
                                            : helperText,
                                        InputLabelProps: {
                                            shrink: true,
                                        },
                                        InputProps: {
                                            startAdornment,
                                        },
                                        ...(placeholder && {
                                            placeholder,
                                        }),
                                    },
                                },
                            }}
                        />
                    </StyledFormControlTheme>
                </LocalizationProvider>
            </ThemeProvider>
        );
    }
);

export default memo(DatePicker);
