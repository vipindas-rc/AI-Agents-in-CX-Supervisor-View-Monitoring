import type { FC } from 'react';

import { FormControl as FormControlUI, FormHelperText } from '@mui/material';

import { InputLabel } from './FormControl.styled';
import type { IFormControlProps } from './types';

const FormControl: FC<IFormControlProps> = ({
    label,
    name,
    message,
    error,
    required,
    children,
    errorId,
}) => (
    <FormControlUI variant='standard' fullWidth>
        <InputLabel shrink htmlFor={name} required={required}>
            {label}
        </InputLabel>
        {children}
        {error && (
            <FormHelperText id={errorId} error={error}>
                {message}
            </FormHelperText>
        )}
    </FormControlUI>
);

export default FormControl;
