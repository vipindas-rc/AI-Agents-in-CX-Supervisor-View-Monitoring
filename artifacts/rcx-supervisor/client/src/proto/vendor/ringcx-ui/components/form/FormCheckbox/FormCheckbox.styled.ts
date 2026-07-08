import { FormControlLabel } from '@mui/material';
import styled from 'styled-components';

import { focusVisibleStyles } from '../../../helpers/accessibility/accessibility';
import { Information } from '../../../icons/Information';

export const Icon = styled(Information)`
    padding: 0;
    &::before {
        font-weight: normal;
    }
`;
Icon.displayName = 'Icon';

export const IconWrapper = styled.span`
    vertical-align: middle;
    line-height: 1;
    font-size: 16px;
    margin-left: 8px;
    margin-right: 8px;

    ${focusVisibleStyles}
`;
IconWrapper.displayName = 'IconWrapper';

export const Label = styled(FormControlLabel)`
    margin-left: 0;
    align-items: flex-start;

    .MuiCheckbox-root {
        margin-top: 1px;
    }

    .MuiFormControlLabel-label {
        padding-left: 12px;
        letter-spacing: 0.25px;
        line-height: 1.429;
        font-family: ${({ theme }) => theme.font.family};
    }
    align-items: flex-start;
    & svg {
        margin-top: 2px;
    }
`;
Label.displayName = 'Label';

export const FormCheckboxContainer = styled.div<{
    labelCompensation?: boolean;
    margin?: number;
}>`
    display: flex;
    padding-top: ${({ labelCompensation }) =>
        labelCompensation ? '29px' : '0'};
    margin-bottom: ${({ margin }) => margin}px;

    // Override for the Checkbox label alignment for the Service Web
    & label.MuiFormControlLabel-root {
        display: inline-flex;
    }
`;
