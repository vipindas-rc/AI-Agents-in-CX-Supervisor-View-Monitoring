import { styled } from 'styled-components';

export const StyledStepperWrapper = styled('div')`
    display: flex;
    align-items: center;
`;

export const StyledNumericInputWrapper = styled('div')`
    display: inline-block;
    width: 60px;
    max-width: 60px;
    margin: 0px 4px;

    .MuiInputBase-root {
        padding: 0px;
    }

    input {
        text-align: center;
    }
`;

export const StyledExtraInfo = styled('span')`
    color: ${({ theme }) => {
        return theme.colors.gray[700];
    }};
    margin-left: 8px;
`;
