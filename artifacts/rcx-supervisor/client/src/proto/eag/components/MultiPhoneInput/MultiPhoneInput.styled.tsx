import { FormTextArea } from '@ringcx/ui';
import styled from 'styled-components';

export const StyledFormTextArea = styled(FormTextArea)`
    && {
        textarea {
            overflow-y: auto;
            box-sizing: content-box;
            padding: 6px 12px;
            line-height: 20px;
            border: 1px solid;
        }
    }
`;

export const Wrapper = styled.div<{ error?: boolean }>`
    label {
        line-height: 18px;
        margin: 0;
        letter-spacing: unset;
        vertical-align: unset;
        color: var(--label-color);
    }

    textarea {
        &:hover {
            border-color: ${({ error, theme }) =>
                error
                    ? theme.colors.accent.firetruck
                    : theme.colors.primary} !important;
        }
        border-color: ${({ error, theme }) =>
            error
                ? theme.colors.accent.firetruck
                : theme.colors.gray[300]} !important;
    }

    .error-message {
        color: var(--label-color);
    }
`;
