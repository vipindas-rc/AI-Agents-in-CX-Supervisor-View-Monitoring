import type { ChangeEvent } from 'react';
import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { parsePhoneNumber } from '@ringcx/shared';

import type { IPhoneInputProps } from './types';
import { themeV4toV5 } from '../../../theme/theme';
import Tooltip from '../../Tooltip';
import { FormControl } from '../FormControl';
import {
    Input,
    InputWrapper,
    InputAdornment,
    TooltipAdornment,
} from '../Input.styled';

const PhoneInput = forwardRef<HTMLInputElement, IPhoneInputProps>(
    (
        {
            label,
            name,
            message,
            error,
            required,
            leftIcon,
            rightIcon,
            tooltipIcon,
            value: valueProp = '',
            onBlur,
            forceParse = true,
            setValue: setValueInForm,
            ...restProps
        },
        ref
    ) => {
        const prevValue = useRef<string>('');
        const isOriginalE164Valid = useRef<boolean>(false);

        const [value, setValue] = useState<string>(() => {
            const { value, e164, isValid } = parsePhoneNumber(valueProp, {
                forceParse: false,
                useReductionToE164: false,
            });

            prevValue.current = isValid ? e164 : valueProp;
            isOriginalE164Valid.current = isValid;
            return value;
        });

        const calculate = useCallback(
            (value: string) => {
                const {
                    value: formattedPhoneNumber,
                    isValid,
                    e164,
                } = parsePhoneNumber(value, {
                    forceParse: forceParse,
                    useReductionToE164: isOriginalE164Valid.current,
                });

                const newValue = isValid ? e164 : formattedPhoneNumber;
                const isValueChanged = newValue !== prevValue.current;

                if (isValueChanged) {
                    setValue(formattedPhoneNumber);
                    setValueInForm(name, newValue);
                    prevValue.current = newValue;
                }
            },
            [setValueInForm, name, forceParse]
        );

        const handleChange = useCallback(
            ({ target: { value } }: ChangeEvent<HTMLInputElement>) => {
                setValue(value);
                calculate(value);
            },
            [calculate]
        );

        useEffect(() => {
            calculate(valueProp);
        }, [valueProp, calculate]);

        const handleBlur = useCallback(() => {
            calculate(value);
            onBlur();
        }, [onBlur, calculate, value]);

        return (
            <ThemeProvider theme={themeV4toV5}>
                <FormControl
                    label={label}
                    message={message}
                    required={required}
                    name={name}
                    error={error}
                >
                    <InputWrapper>
                        <Input
                            id={name}
                            error={error}
                            value={value}
                            startAdornment={
                                leftIcon && (
                                    <InputAdornment position='start'>
                                        {leftIcon}
                                    </InputAdornment>
                                )
                            }
                            endAdornment={
                                rightIcon && (
                                    <InputAdornment position='end'>
                                        {rightIcon}
                                    </InputAdornment>
                                )
                            }
                            {...restProps}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            ref={ref}
                        />
                        {tooltipIcon && (
                            <Tooltip title={tooltipIcon.message}>
                                <TooltipAdornment>
                                    {tooltipIcon.icon}
                                </TooltipAdornment>
                            </Tooltip>
                        )}
                    </InputWrapper>
                </FormControl>
            </ThemeProvider>
        );
    }
);

export default PhoneInput;
