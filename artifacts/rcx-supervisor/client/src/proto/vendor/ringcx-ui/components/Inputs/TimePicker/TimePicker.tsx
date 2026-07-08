import {
    memo,
    forwardRef,
    useCallback,
    useEffect,
    useMemo,
    useState,
} from 'react';

import { IconButton, InputAdornment } from '@material-ui/core';
import type { DeprecatedThemeOptions } from '@mui/material';
import { createTheme } from '@mui/material';
import { ThemeProvider, adaptV4Theme } from '@mui/material/styles';
import type { TimeValidationError } from '@mui/x-date-pickers';
import { AdapterLuxon } from '@mui/x-date-pickers/AdapterLuxon';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import type { PickerChangeHandlerContext } from '@mui/x-date-pickers/models';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import { DateTime, Languages } from '@ringcx/shared';
import { useTranslation } from 'react-i18next';

import type { ITimePickerProps } from './types';
import { CloseSvg, Time } from '../../../icons';
import { i18next } from '../../../services/translate';
import { getThemeByBrandId, getBrandId } from '../../../theme/theme';
import { StyledFormControlTheme } from '../../FormControl/FormControlTheme.styled';
import { StyledTimePaperWrapper } from '../../Paper/Paper.styled';

const TimePicker = forwardRef<HTMLDivElement, ITimePickerProps>(
    (
        {
            value = null,
            disabled = false,
            onChange,
            title = '',
            error = false,
            helperText,
            minTime,
            maxTime,
            shouldDisableClock = () => false,
            invalidTimeMessage = 'Invalid Time Format',
            required = false,
            size = 'small',
            locale = Languages.EN_US,
            legacyHelperText = false,
            placeholder,
            popperZindex,
            canClear = false,
            timezone,
            additionalOnChangeProps,
            scriptPreview = false,
        },
        ref
    ) => {
        const [isValidTime, setIsValidTime] = useState(true);

        const brandId = getBrandId();
        const theme = getThemeByBrandId(brandId);
        const { t } = useTranslation(undefined, { i18n: i18next });

        const ampm = DateTime.isLocale12Hour(locale);

        const onChangeHandler = useCallback(
            (
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                dateTime: any, // This value is coming from TimePicker as unknown
                context: PickerChangeHandlerContext<TimeValidationError>
            ) => {
                if (
                    context.validationError &&
                    context.validationError !== null
                ) {
                    setIsValidTime(false);
                }

                dateTime &&
                    DateTime.isValidDateTime(dateTime) &&
                    onChange(dateTime, additionalOnChangeProps);
            },
            [onChange, additionalOnChangeProps]
        );

        useEffect(() => {
            const isValid = value === null || value?.isValid;
            setIsValidTime(isValid);

            const isValidMinTime = !!(
                value &&
                minTime &&
                value.toMillis() < minTime.toMillis()
            );
            const isValidMaxTime = !!(
                value &&
                maxTime &&
                value.toMillis() > maxTime.toMillis()
            );

            setIsValidTime(!isValidMinTime && !isValidMaxTime);
        }, [value, minTime, maxTime]);

        const handleClearValue = useCallback(() => {
            if (!disabled) {
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
                                'aria-label': t('ARIA_LABELS.CLEAR_TIME'),
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
                        <MuiTimePicker
                            {...{
                                slots: {
                                    openPickerIcon: () => <Time />,
                                    layout: (paperProps) => (
                                        <StyledTimePaperWrapper
                                            {...paperProps}
                                        />
                                    ),
                                },
                                disabled,
                                value,
                                minTime,
                                maxTime,
                                ampm,
                                timezone,
                                onChange: onChangeHandler,
                                shouldDisableClock,
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
                                    },
                                    textField: {
                                        variant: 'outlined',
                                        label: title,
                                        inputRef: ref,
                                        required,
                                        fullWidth: true,
                                        error: !isValidTime || error,
                                        helperText: !isValidTime
                                            ? invalidTimeMessage
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

export default memo(TimePicker);
