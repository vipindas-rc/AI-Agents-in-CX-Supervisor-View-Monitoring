import {
    memo,
    useMemo,
    useState,
    useEffect,
    useCallback,
    forwardRef,
    useRef,
} from 'react';

import { IconButton, InputAdornment } from '@material-ui/core';
import type { DeprecatedThemeOptions } from '@mui/material';
import { createTheme } from '@mui/material';
import { ThemeProvider, adaptV4Theme } from '@mui/material/styles';
import type { DateTimeValidationError } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { PickerChangeHandlerContext } from '@mui/x-date-pickers/models';
import { DateTime, Languages } from '@ringcx/shared';

import type { IDateTimePickerProps } from './types';
import { Calendar, CloseSvg } from '../../../icons';
import { getThemeByBrandId, getBrandId } from '../../../theme/theme';
import { StyledFormControlTheme } from '../../FormControl/FormControlTheme.styled';
import { StyledPaper } from '../../Paper/Paper.styled';

const {
    DATETIME_FORMAT: { LOCALISED_DATE_TIME_SHORT },
} = DateTime;

const DateTimePicker = forwardRef<HTMLDivElement, IDateTimePickerProps>(
    (
        {
            value = null,
            disabled = false,
            onChange,
            title = '',
            error = false,
            helperText,
            shouldDisableDate = () => false,
            maxDateTime,
            minDateTime,
            invalidDateTimeMessage = 'Invalid Date Time Format',
            required = false,
            size = 'small',
            format = LOCALISED_DATE_TIME_SHORT,
            timezone,
            locale = Languages.EN_US,
            canClear = false,
            legacyHelperText = false,
            placeholder,
            popperZindex,
            onFocus,
            onBlur,
            inputId,
            ariaLabelledBy,
        },
        ref
    ) => {
        const [isValidDateTime, setIsValidDateTime] = useState(true);
        const [selectedDts, setSelectedDts] = useState(value);
        const fieldContainerRef = useRef<HTMLDivElement | null>(null);

        const wrapperTabIndex = ariaLabelledBy && !disabled ? 0 : -1;

        const handleWrapperKeyDown = useCallback(
            (e: React.KeyboardEvent<HTMLDivElement>) => {
                if (
                    e.key === 'Tab' &&
                    !e.shiftKey &&
                    e.target === fieldContainerRef.current
                ) {
                    e.preventDefault();
                    const firstInput =
                        fieldContainerRef.current?.querySelector('input');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }
            },
            []
        );

        const handleWrapperFocus = useCallback(() => {
            if (onFocus) {
                onFocus();
            }
        }, [onFocus]);

        const brandId = getBrandId();
        const theme = getThemeByBrandId(brandId);

        const ampm = DateTime.isLocale12Hour(locale);

        const onChangeHandler = useCallback(
            (
                dateTime: any, // This value is coming as unknown from DateTimePicker
                context: PickerChangeHandlerContext<DateTimeValidationError>
            ) => {
                if (
                    context.validationError &&
                    context.validationError !== null
                ) {
                    setIsValidDateTime(false);
                }
                if (dateTime && DateTime.isValidDateTime(dateTime)) {
                    onChange(dateTime);
                    setSelectedDts(dateTime);
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
        }, [selectedDts, timezone, onChange]);

        useEffect(() => {
            const isValid = value === null || value?.isValid;
            setIsValidDateTime(isValid);

            const minValidDateTime = !!(
                value &&
                minDateTime &&
                value.set({ second: 59 }).toMillis() <
                    minDateTime.set({ second: 0 }).toMillis()
            );
            const maxValidDateTime = !!(
                value &&
                maxDateTime &&
                value.set({ second: 0 }).toMillis() >
                    maxDateTime.set({ second: 59 }).toMillis()
            );

            setIsValidDateTime(!minValidDateTime && !maxValidDateTime);
            setSelectedDts(value);
        }, [value, maxDateTime, minDateTime]);

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
                                disabled,
                                onClick: handleClearValue,
                            }}
                        >
                            <CloseSvg />
                        </IconButton>
                    </InputAdornment>
                )
            );
        }, [disabled, handleClearValue, value, canClear]);

        const dateTimePickerContent = (
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
                        <MuiDateTimePicker
                            {...{
                                slots: {
                                    openPickerIcon: () => <Calendar />,
                                    layout: (paperProps) => (
                                        <StyledPaper {...paperProps} />
                                    ),
                                },
                                ampm,
                                disabled,
                                value: selectedDts,
                                onOpen: onOpenHandler,
                                onChange: onChangeHandler,
                                shouldDisableDate,
                                format,
                                timezone,
                                maxDateTime,
                                minDateTime,
                                slotProps: {
                                    popper: {
                                        style: {
                                            ...(popperZindex && {
                                                zIndex: popperZindex,
                                            }),
                                        },
                                    },
                                    textField: {
                                        variant: 'outlined',
                                        label: title,
                                        id: inputId,
                                        ref,
                                        required,
                                        fullWidth: true,
                                        error: !isValidDateTime || error,
                                        helperText: !isValidDateTime
                                            ? invalidDateTimeMessage
                                            : helperText,
                                        InputLabelProps: {
                                            shrink: true,
                                        },
                                        InputProps: {
                                            startAdornment,
                                        },
                                        onFocus,
                                        onBlur,
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

        if (ariaLabelledBy) {
            return (
                <div
                    ref={fieldContainerRef}
                    tabIndex={wrapperTabIndex}
                    aria-labelledby={ariaLabelledBy}
                    onKeyDown={handleWrapperKeyDown}
                    onFocus={handleWrapperFocus}
                    role='group'
                    style={{ outline: 'none' }}
                >
                    {dateTimePickerContent}
                </div>
            );
        }

        return dateTimePickerContent;
    }
);

export default memo(DateTimePicker);
