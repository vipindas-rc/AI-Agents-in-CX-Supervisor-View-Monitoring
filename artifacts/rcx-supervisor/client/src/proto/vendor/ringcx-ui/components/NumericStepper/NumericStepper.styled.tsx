import type { ComponentType } from 'react';

import styled, { css } from 'styled-components';

import { NumericStepperSizes } from './types';
import IconButton from '../IconButton/IconButton';
import { NumberInput } from '../Inputs/NumberInput';
// TODO: deal with any
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const StyledIconButton: ComponentType<any> = styled(IconButton)`
    && {
        &:hover {
            svg .symbol {
                fill: ${({ theme }) => theme.colors.gray[900]};
            }
        }
    }

    ${({ disabled, theme }) =>
        css`svg { fill: ${theme.colors.gray[disabled ? 300 : 700]}`}
`;

export const StyledStepperWrapper = styled.span<{ size: NumericStepperSizes }>`
    display: flex;
    flex-direction: row;
    align-items: center;
    height: ${({ size }) => (size === NumericStepperSizes.MEDIUM ? 40 : 32)}px;
`;

export const StyledStepper = styled.span`
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    height: auto;
    width: 105px;
    max-width: 105px;
`;

export const StyledNumericStepper = styled(NumberInput)`
    width: 41px;
    max-width: 41px;
    margin: 0 4px;
    & > input {
        text-align: center;
        padding: 0;
    }
`;

export const StyledExtraInfo = styled.span`
    color: ${({ theme }) => theme.colors.gray[700]};
    margin-left: 8px;
`;
