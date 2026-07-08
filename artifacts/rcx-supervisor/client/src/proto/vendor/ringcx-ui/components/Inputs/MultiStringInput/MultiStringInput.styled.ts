import { Chip, TextField } from '@mui/material';
import styled from 'styled-components';

import { MultiInput } from '../MultiInput';

export const StyledMultiStringInput = styled(MultiInput)<{
    error?: boolean;
    maxHeight?: string;
}>`
    .MuiOutlinedInput-root {
        padding-left: 11px;
        padding-top: 6px;
        padding-bottom: 6px;
        gap: 12px;
        max-height: ${({ maxHeight }) => maxHeight || '128px'};
        overflow-y: auto;
        position: static;

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

        .MuiAutocomplete-input {
            min-width: 30px;
        }

        .MuiOutlinedInput-notchedOutline {
            border-color: ${({ error, theme }) =>
                error ? theme.colors.error : theme.colors.gray[300]};
        }

        &:hover .MuiOutlinedInput-notchedOutline {
            border-color: ${({ error, theme }) =>
                error ? theme.colors.error : theme.colors.gray[500]};
        }

        &.Mui-focused .MuiOutlinedInput-notchedOutline {
            border-color: ${({ theme }) => theme.colors.primary};
            border-width: 1px;
        }
    }
`;

export const StyledTextInput = styled(TextField)``;

export const StyledChip = styled(Chip)`
    height: 20px;
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.gray[0]};
    font-size: 12px;

    .MuiChip-deleteIcon {
        font-size: 12px;
        color: ${({ theme }) => theme.colors.gray[0]};
        opacity: 0.5;
    }
    .MuiChip-label {
        padding: 2px 13px 2px 8px;
    }
`;
