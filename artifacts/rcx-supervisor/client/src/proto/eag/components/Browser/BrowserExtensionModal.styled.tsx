import { TextInput, Dialog, Button } from '@ringcx/ui';
import styled from 'styled-components';

export const StyledInput = styled(TextInput)`
    border-radius: 10px;
    &&.MuiInputBase-root {
        background-color: var(--sui-colors-neutral-w0);
        color: var(--sui-colors-neutral-b0);
        border-color: var(--sui-colors-neutral-b0-t20);
    }

    &&.MuiInputBase-root:hover:not(.Mui-disabled) {
        border-color: var(--sui-colors-neutral-b0-t30);
    }

    &&.MuiInputBase-root.Mui-focused {
        border-color: var(--sui-colors-primary-b);
    }

    &&.MuiInputBase-root input {
        color: var(--sui-colors-neutral-b0);
    }

    &&.MuiInputBase-root input::placeholder {
        color: var(--sui-colors-neutral-b2);
    }
`;

export const StyledManualKeyField = styled.div`
    .MuiFormControl-root .MuiInputLabel-root {
        color: var(--sui-colors-neutral-b0);
        font-size: 11px;
        font-weight: 500;
    }

    .MuiInputBase-root svg {
        width: 16px;
        height: 16px;
        color: var(--sui-colors-neutral-b0);
    }
`;
export const StyledDialog = styled(Dialog)`
    && ~ .MuiTooltip-popper {
        max-width: 200px;
        z-index: 10000 !important;
        .MuiTooltip-tooltip {
            padding: 8px 12px;
            background-color: var(--sui-colors-neutral-b1);
            color: var(--sui-colors-neutral-w0);
            font-size: 11px;
            line-height: 17px;
            font-weight: 500;
        }
    }
    && {
        .MuiDialog-container {
            z-index: 99;
        }
        .MuiPaper-root {
            border-radius: 10px;
            border: 1px solid var(--sui-colors-neutral-b0-t20);
            background-color: var(--sui-colors-neutral-base);
            z-index: 99;
            h2 {
                font-size: 17px;
                font-weight: 500;
                padding: 12px 24px;
                letter-spacing: 0.15px;
                margin: 0;
                color: var(--sui-colors-neutral-b0);
            }
        }
        .MuiDialogTitle-root {
            padding: 0;
        }
    }
`;
export const StyledButton = styled(Button)<{ isCancel?: boolean }>`
    && {
        padding: 4px 8px;
        height: 32px;
        border: 1px solid var(--sui-colors-neutral-b0-t20);
        > span {
            color: ${({ isCancel }) =>
                isCancel
                    ? 'var(--sui-colors-neutral-b0)'
                    : 'var(--sui-colors-neutral-static-w0)'};
        }
    }
`;
export const Subtitle = styled.p`
    color: var(--sui-colors-neutral-b2);
    font-size: 13px;
    font-weight: 400;
`;
