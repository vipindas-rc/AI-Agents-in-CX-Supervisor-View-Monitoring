import { FormControl, FormControlLabel } from '@mui/material';
import styled from 'styled-components';

import type { FormRadioGroupProps } from './types';

export const Label = styled(FormControlLabel)`
    align-items: flex-start;
    margin-left: 0;
    margin-bottom: 20px;

    &:last-child {
        margin-bottom: 0;
    }

    .MuiRadio-root {
        padding: 2px 0;
    }

    .MuiFormControlLabel-label {
        padding-left: 12px;
        letter-spacing: 0.25px;
        line-height: 1.429;
        font-family: ${({ theme }) => theme.font.family};
    }
`;

export const StyledFormControl = styled(FormControl)<{
    orientation: FormRadioGroupProps['orientation'];
}>`
    > div {
        flex-direction: ${({ orientation }) => orientation};
    }
`;

Label.displayName = 'Label';
