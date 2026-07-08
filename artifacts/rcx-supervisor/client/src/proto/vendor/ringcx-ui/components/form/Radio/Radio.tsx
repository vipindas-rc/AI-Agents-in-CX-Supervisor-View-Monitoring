import { forwardRef } from 'react';

import type { RadioProps } from '@mui/material';
import { Radio as MUIRadio } from '@mui/material';

import { Checked, Unchecked } from './icons';

export const Radio = forwardRef<HTMLButtonElement, RadioProps>((props, ref) => {
    return (
        <MUIRadio
            icon={<Unchecked disabled={props.disabled} />}
            checkedIcon={<Checked disabled={props.disabled} />}
            disableRipple
            {...props}
            ref={ref}
        />
    );
});
