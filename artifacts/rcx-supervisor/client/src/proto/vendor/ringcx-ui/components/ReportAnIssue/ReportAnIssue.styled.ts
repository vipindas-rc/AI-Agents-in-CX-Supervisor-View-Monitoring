import styled from 'styled-components';

import { Dialog } from '../Dialog';
import { FormTextArea } from '../FormTextArea';

export const FeedbackLabel = styled.label`
    display: inline-block;
    color: ${({ theme }) => theme.colors.gray[800]};
    font-family: Roboto;
    font-size: 12px;
    font-style: normal;
    line-height: 16px;
    margin-bottom: 6px;
    &:not(:first-child) {
        margin-top: 12px;
    }
    & > span {
        color: ${({ theme }) => theme.colors.accent.firetruck};
        margin-left: 2px;
    }

    /*
    * Adding more specificity to override styles from EUA
    */

    && {
        font-weight: 500;
    }
`;

export const ContentWrapper = styled.div`
    display: flex;
    flex-direction: column;
    gap: 20px;
`;

export const DescriptionWrapper = styled.div`
    font-size: 12px;
    line-height: 16px;
    color: ${({ theme }) => theme.colors.gray[800]};
    font-weight: 400;
`;

export const Asterisk = styled.span`
    color: ${({ theme }) => theme.colors.accent.firetruck};
    font-size: 12px;
    line-height: 16px;
`;

export const StyledFormTextArea = styled(FormTextArea)`
    height: 94px;
    textarea {
        height: 94px;
    }
`;

export const StyledDialog = styled(Dialog)`
    && {
        [class*='MuiPaper-root'] {
            max-width: 500px;
        }
    }

    .MuiInputBase-root {
        height: 40px;
    }

    /*
    * Adding more specificity to override styles from EUA
    */

    .MuiAutocomplete-root .MuiInputBase-root {
        padding: 4px 12px;
        .MuiAutocomplete-endAdornment {
            display: flex;
        }

        fieldset legend {
            width: auto;
        }
    }

    /*
    * Adding more specificity to override styles from EAC
    */

    .MuiButton-root {
        font-size: 14px;
    }

    .MuiDialogActions-root {
        .MuiButton-containedPrimary {
            color: ${({ theme }) => theme.colors.gray[0]};
        }

        .MuiButton-textPrimary {
            color: ${({ theme }) => theme.colors.primary};
        }
    }
`;
