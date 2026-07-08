import { forwardRef } from 'react';

import { ThemeProvider } from '@mui/material/styles';

import { StyledInputWrapper } from './TextInput.styled';
import { themeV4toV5 } from '../../../theme/theme';
import Tooltip from '../../Tooltip';
import { FormControl } from '../FormControl';
import { Input, InputAdornment, TooltipAdornment } from '../Input.styled';
import type { IInputProps } from '../types';

/**
 *@deprecated
 * DO NOT USE THIS DIRECTLY, use renderTextInputControl helper instead
 */
const TextInput = forwardRef<HTMLInputElement, IInputProps>(
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
            type,
            maxLength,
            ...props
        },
        ref
    ) => (
        <ThemeProvider theme={themeV4toV5}>
            <FormControl
                label={label}
                message={message}
                required={required}
                name={name}
                error={error}
                errorId={'text-input-error-field'}
            >
                <StyledInputWrapper>
                    <Input
                        inputProps={{
                            maxLength,
                        }}
                        id={name}
                        error={error}
                        type={type}
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
                        {...{
                            ...props,
                            ...(error
                                ? {
                                      'aria-describedby':
                                          'text-input-error-field',
                                  }
                                : {}),
                        }}
                        ref={ref}
                    />
                    {tooltipIcon && (
                        <Tooltip title={tooltipIcon.message} arrow>
                            <TooltipAdornment>
                                {tooltipIcon.icon}
                            </TooltipAdornment>
                        </Tooltip>
                    )}
                </StyledInputWrapper>
            </FormControl>
        </ThemeProvider>
    )
);

export default TextInput;
