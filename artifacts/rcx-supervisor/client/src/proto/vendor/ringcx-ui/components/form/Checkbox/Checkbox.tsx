import { forwardRef } from 'react';

import type { CheckboxProps } from '@mui/material';
import { Checkbox as MUICheckbox } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';

import { Checked, Indeterminate, Unchecked } from './icons';
import { themeV4toV5 } from '../../../theme/theme';

export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(
    (props, ref) => {
        return (
            <ThemeProvider theme={themeV4toV5}>
                <MUICheckbox
                    sx={{
                        padding: 0,
                    }}
                    color='primary'
                    icon={<Unchecked disabled={props.disabled} />}
                    checkedIcon={<Checked disabled={props.disabled} />}
                    indeterminateIcon={
                        <Indeterminate disabled={props.disabled} />
                    }
                    disableRipple
                    {...props}
                    // Checkbox shouldn't become uncontrolled if checked is undefined
                    checked={!!props.checked}
                    ref={ref}
                    inputProps={{
                        ...props.inputProps,
                        ...(props['aria-label'] !== undefined
                            ? { 'aria-label': props['aria-label'] }
                            : {}),
                    }}
                />
            </ThemeProvider>
        );
    }
);
