import { forwardRef, useCallback } from 'react';

import { ThemeProvider } from '@mui/material/styles';
import { useRifm } from 'rifm';

import type { INumberInputProps } from './types';
import { extractNumber } from '../../../helpers';
import { themeV4toV5 } from '../../../theme/theme';
import Tooltip from '../../Tooltip';
import { FormControl } from '../FormControl';
import {
    Input,
    InputAdornment,
    InputWrapper,
    TooltipAdornment,
} from '../Input.styled';

const NumberInput = forwardRef<HTMLInputElement, INumberInputProps>(
    (
        {
            label,
            value,
            onChange,
            onBlur,
            name,
            error,
            message,
            required,
            leftIcon,
            rightIcon,
            tooltipIcon,
            min = 0,
            max,
            ...restProps
        },
        ref
    ) => {
        const formatNumber = useCallback((val: string) => {
            const extractedValue = extractNumber(val);
            const num = parseInt(extractedValue, 10) || 0;
            return num.toString();
        }, []);

        const rifm = useRifm({
            value: !value ? min.toString() : value.toString(),
            onChange: onChange,
            format: formatNumber,
        });

        const handleBlur = useCallback(() => {
            const parsed = parseInt(formatNumber(rifm.value), 10);
            const result =
                max && parsed > max
                    ? max
                    : parsed < min
                      ? min
                      : formatNumber(rifm.value);

            onChange(result.toString());
            onBlur();
        }, [formatNumber, rifm.value, max, min, onChange, onBlur]);

        return (
            <ThemeProvider theme={themeV4toV5}>
                <FormControl {...{ required, name, label, message, error }}>
                    <InputWrapper>
                        <Input
                            id={name}
                            error={error}
                            value={rifm.value}
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
                            onChange={rifm.onChange}
                            onBlur={handleBlur}
                            {...restProps}
                            ref={ref}
                        />
                        {tooltipIcon && (
                            <Tooltip
                                title={tooltipIcon.message}
                                placement='top'
                                arrow
                            >
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

export default NumberInput;
