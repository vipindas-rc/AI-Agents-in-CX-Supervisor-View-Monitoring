import { Chip, TextField } from '@mui/material';
import styled from 'styled-components';

import { MultiInput } from '../MultiInput';

export const StyledMultiPhoneInput = styled(MultiInput)<{
    error?: boolean;
}>`
    .MuiOutlinedInput-root {
        padding-left: 11px;
        padding-top: 6px;
        padding-bottom: 6px;

        .MuiOutlinedInput-input {
            padding-top: 0;
            padding-bottom: 0;
            padding-left: 0;
        }

        .MuiIconButton-root {
            color: ${({ theme }) => theme.colors.gray[700]};
        }

        .MuiAutocomplete-endAdornment {
            top: unset;
        }

        .MuiOutlinedInput-notchedOutline {
            border-color: ${({ error, theme }) =>
                error ? theme.colors.error : theme.colors.gray[300]};
        }

        &:hover .MuiOutlinedInput-notchedOutline {
            border-color: ${({ error, theme }) =>
                error ? theme.colors.error : theme.colors.gray[700]};
        }

        &.Mui-focused .MuiOutlinedInput-notchedOutline {
            border-color: ${({ theme }) => theme.colors.primary};
            border-width: 1px;
        }
    }
`;

export const StyledTextInput = styled(TextField)``;

export const StyledChip = styled(Chip)`
    font-family: ${({ theme }) => theme.font.family};
    height: 20px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.gray[0]};
    font-size: 12px;
    margin-right: 4px;
    .MuiChip-deleteIcon {
        font-size: 12px;
        color: ${({ theme }) => theme.colors.gray[0]};
        opacity: 0.5;
    }
    .MuiChip-label {
        padding: 2px 24px 2px 8px;
    }
`;
