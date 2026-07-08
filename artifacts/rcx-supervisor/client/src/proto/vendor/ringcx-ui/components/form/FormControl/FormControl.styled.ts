import { InputLabel as InputLabelUI } from '@mui/material';
import { css, styled } from 'styled-components';

export const InputLabel = styled(InputLabelUI)`
    position: static;
    font-family: ${({ theme }) => theme.font.family};
    font-weight: ${({ theme }) => theme.font.subheader.fontWeight};
    color: ${({ theme }) => {
        return theme.colors.gray[800];
    }};
    margin-bottom: 6px;
    transform: none;
    font-size: ${({ theme }) => theme.font.size.label};
    line-height: 16px;
    letter-spacing: ${({ theme }) => theme.font.letterSpacing.label};

    ${({ theme }) =>
        theme.isSWIframe &&
        css`
            text-transform: capitalize;
        `}

    &.Mui-focused {
        color: ${({ theme }) => {
            return theme.colors.gray[800];
        }};
    }

    .MuiInputLabel-asterisk {
        color: ${({ theme }) => {
            return theme.colors.accent.orange;
        }};
        font-size: 14px;
        position: absolute;
    }
`;
