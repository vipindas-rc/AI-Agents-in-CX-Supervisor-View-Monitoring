import styled, { css } from 'styled-components';

import { TextInput } from '../TextInput';

export const StyledP = styled.p`
    margin: 0;
`;

export const LegacyTextStyled = styled.div`
    font-size: 0.78em;
    font-style: italic;
    color: ${({ theme }) => theme.colors.gray[850]};
`;

export const StyledPhoneTextInput = styled(TextInput)<{
    disabled: boolean;
    error: boolean;
}>`
    ${({ disabled, error }) =>
        disabled &&
        error &&
        css`
            &&,
            &&:hover {
                border-color: ${({ theme }) => theme.colors.gray[50]};
            }
        `};
`;
