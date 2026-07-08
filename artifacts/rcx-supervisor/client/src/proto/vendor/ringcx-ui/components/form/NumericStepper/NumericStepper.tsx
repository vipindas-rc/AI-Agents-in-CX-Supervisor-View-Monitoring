import type { ChangeEvent, FocusEvent } from 'react';
import { useLayoutEffect, useState, useCallback, forwardRef } from 'react';

import { IconButton } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { clamp } from 'lodash';

import {
    StyledExtraInfo,
    StyledNumericInputWrapper,
    StyledStepperWrapper,
} from './NumericStepper.styled';
import type { INumericStepperProps } from './types';
import { extractNumber } from '../../../helpers';
import { Minus } from '../../../icons/Minus';
import { Plus } from '../../../icons/Plus';
import { themeV4toV5 } from '../../../theme/theme';
import { FormControl } from '../FormControl';
import { Input } from '../Input.styled';

const NumericStepper = forwardRef<HTMLInputElement, INumericStepperProps>(
    (
        {
            label,
            name,
            message,
            error,
            required,
            value,
            minValue = 0,
            maxValue = 999,
            onChange,
            onBlur,
            disabled,
            extraInfo,
            id,
            accessibilityLabels,
            ...restProps
        },
        ref
    ) => {
        const [internalValue, setInternalValue] = useState<string>('');

        useLayoutEffect(() => {
            setInternalValue(
                value === null || isNaN(value)
                    ? minValue.toString()
                    : value.toString()
            );
        }, [minValue, value]);

        useLayoutEffect(() => {
            // Force setting the correct value instead of NaN right after enabling the input from the 'disabled' state
            if (disabled === false && !value && value !== 0) {
                handleOnBlur();
            }
        }, [disabled]);

        const formatNumber = useCallback((val: string) => {
            return extractNumber(val);
        }, []);

        const handleChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>) => {
                const formatted = formatNumber(event.target.value);
                setInternalValue(formatted);

                if (formatted === '') {
                    return;
                }

                const parsed = parseInt(formatted, 10);
                onChange(parsed);
            },
            [formatNumber, onChange]
        );

        const handleValueIncrease = useCallback(
            () => onChange(Math.min(value + 1, maxValue)),
            [onChange, value, maxValue]
        );

        const handleValueDecrease = useCallback(
            () => onChange(Math.max(value - 1, minValue)),
            [onChange, value, minValue]
        );

        const handleOnBlur = useCallback(() => {
            const parsed = parseInt(internalValue, 10);
            const result = Number.isNaN(parsed)
                ? minValue
                : clamp(parsed, minValue, maxValue);

            onChange(result);
            onBlur();
        }, [internalValue, minValue, maxValue, onChange, onBlur]);

        const handleFocus = useCallback(
            (event: FocusEvent<HTMLInputElement>) => {
                event.target.select();
            },
            []
        );

        const decreaseDisabled: boolean = disabled || value === minValue;
        const increaseDisabled: boolean = disabled || value === maxValue;

        return (
            <ThemeProvider theme={themeV4toV5}>
                <FormControl
                    label={label}
                    message={message}
                    required={required}
                    name={name}
                    error={error}
                >
                    <StyledStepperWrapper>
                        <IconButton
                            onClick={handleValueDecrease}
                            disabled={decreaseDisabled}
                            aria-label={accessibilityLabels?.decrease}
                        >
                            <Minus />
                        </IconButton>
                        <StyledNumericInputWrapper>
                            <Input
                                id={name}
                                value={internalValue}
                                error={error}
                                onChange={handleChange}
                                type='text'
                                onFocus={handleFocus}
                                onBlur={handleOnBlur}
                                disabled={disabled}
                                {...restProps}
                                ref={ref}
                            />
                        </StyledNumericInputWrapper>
                        <IconButton
                            onClick={handleValueIncrease}
                            disabled={increaseDisabled}
                            aria-label={accessibilityLabels?.increase}
                        >
                            <Plus />
                        </IconButton>
                        {extraInfo && (
                            <StyledExtraInfo>{extraInfo}</StyledExtraInfo>
                        )}
                    </StyledStepperWrapper>
                </FormControl>
            </ThemeProvider>
        );
    }
);

export default NumericStepper;
