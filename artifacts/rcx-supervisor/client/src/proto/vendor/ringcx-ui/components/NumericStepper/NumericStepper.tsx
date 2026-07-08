import type { FC } from 'react';
import { useCallback, useState } from 'react';

import { useTranslation } from 'react-i18next';

import {
    StyledStepperWrapper,
    StyledStepper,
    StyledNumericStepper,
    StyledIconButton,
    StyledExtraInfo,
} from './NumericStepper.styled';
import type { INumericStepper } from './types';
import { NumericStepperSizes } from './types';
import { TEST_AID } from '../../constants';
import { Plus, Minus } from '../../icons';
import { i18next } from '../../services/translate';
import FormControl from '../FormControl/FormControl';

const NumericStepper: FC<INumericStepper> = ({
    value,
    onChange,
    minValue = 0,
    maxValue = 999,
    size = NumericStepperSizes.MEDIUM,
    disabled = false,
    title,
    error = false,
    message = '',
    required = false,
    extraInfo,
    i18n = i18next,
    ...rest
}) => {
    const { t } = useTranslation(undefined, { i18n });
    const numberOfSymbols: number =
        (maxValue && maxValue.toString().length) || 3;
    const handleValueChange = useCallback(
        (nextValue: string) => onChange(parseInt(nextValue, 10)),
        [onChange]
    );
    const [valueAnnouncement, setValueAnnouncement] = useState<string>('');

    const formatAnnouncement = useCallback(
        (newValue: number) => {
            const titleText =
                typeof title === 'string' || typeof title === 'number'
                    ? `${title} `
                    : '';
            return `${titleText}${newValue}`.trim() || String(newValue);
        },
        [title]
    );

    const handleValueIncrease = useCallback(() => {
        const result = value >= maxValue ? maxValue : value + 1;
        onChange(result);
        setValueAnnouncement(formatAnnouncement(result));
    }, [maxValue, onChange, value, formatAnnouncement]);

    const handleValueReduce = useCallback(() => {
        const result = value <= minValue ? minValue : value - 1;
        onChange(result);
        setValueAnnouncement(formatAnnouncement(result));
    }, [minValue, onChange, value, formatAnnouncement]);

    const reduceDisabled: boolean = disabled || value === minValue;
    const increaseDisabled: boolean = disabled || value === maxValue;

    const stepper = (
        <StyledStepperWrapper size={size}>
            <StyledStepper>
                <StyledIconButton
                    disabled={reduceDisabled}
                    onClick={handleValueReduce}
                    data-aid={TEST_AID.NUMERIC_STEPPER.MINUS_BUTTON}
                    aria-label={t('ARIA_LABELS.MINUS')}
                >
                    <Minus />
                </StyledIconButton>
                <StyledNumericStepper
                    value={value.toString()}
                    onChange={handleValueChange}
                    min={minValue}
                    max={maxValue}
                    maxLength={numberOfSymbols}
                    disabled={disabled}
                    size={size}
                    {...rest}
                />
                <StyledIconButton
                    disabled={increaseDisabled}
                    onClick={handleValueIncrease}
                    data-aid={TEST_AID.NUMERIC_STEPPER.PLUS_BUTTON}
                    aria-label={t('ARIA_LABELS.PLUS')}
                >
                    <Plus />
                </StyledIconButton>
            </StyledStepper>
            {valueAnnouncement && (
                <span aria-live='polite' aria-atomic='true' className='sr-only'>
                    {valueAnnouncement}
                </span>
            )}
            {extraInfo && <StyledExtraInfo>{extraInfo}</StyledExtraInfo>}
        </StyledStepperWrapper>
    );

    if (!title) {
        return stepper;
    }

    return (
        <FormControl
            {...{
                title,
                required,
                error,
                message,
                ...rest,
            }}
        >
            {stepper}
        </FormControl>
    );
};

export default NumericStepper;
