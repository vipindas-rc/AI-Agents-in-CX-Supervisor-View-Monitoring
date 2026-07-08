import MuiRadio from '@material-ui/core/Radio';
import styled, { css } from 'styled-components';

import { RadioChecked } from './assets/RadioChecked';
import { RadioUnchecked } from './assets/RadioUnchecked';

export const StyledRadioUnchecked = styled(RadioUnchecked)`
    && {
        width: 16px;
        height: 16px;
    }
`;

export const StyledRadioChecked = styled(RadioChecked)`
    && {
        color: ${({ theme }) => theme.colors.primary};
        width: 16px;
        height: 16px;
    }
`;

export const StyledRadio = styled(MuiRadio)<{ disabled: boolean }>`
    && {
        align-self: flex-start;
        margin-top: 1px;
        padding: 0;
        &:hover {
            background-color: transparent;
        }
        ${({ disabled, theme }) =>
            disabled &&
            css`
                svg {
                    color: ${theme.colors.gray[300]};
                }
            `};
    }
`;
