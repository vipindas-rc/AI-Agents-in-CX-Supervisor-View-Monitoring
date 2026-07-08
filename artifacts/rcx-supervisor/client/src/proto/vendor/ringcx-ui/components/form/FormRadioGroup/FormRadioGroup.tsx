import { forwardRef } from 'react';

import { RadioGroup as MUIRadioGroup } from '@mui/material';

import { Label, StyledFormControl } from './FormRadioGroup.styled';
import type { FormRadioGroupProps } from './types';
import { Radio } from '../Radio';

export const FormRadioGroup = forwardRef<
    HTMLButtonElement,
    FormRadioGroupProps
>(({ name, options, disabled, orientation = 'row', ...rest }, ref) => {
    return (
        <StyledFormControl orientation={orientation}>
            <MUIRadioGroup name={name} {...rest}>
                {options.map(({ label, value }) => (
                    <Label
                        key={value}
                        control={
                            <Radio
                                role='none'
                                disabled={disabled}
                                color='primary'
                                ref={ref}
                            />
                        }
                        label={label}
                        value={value}
                    />
                ))}
            </MUIRadioGroup>
        </StyledFormControl>
    );
});
