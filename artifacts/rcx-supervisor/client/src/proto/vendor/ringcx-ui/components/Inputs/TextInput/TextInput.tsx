import type { ChangeEvent } from 'react';
import { useCallback, useEffect, useRef, forwardRef, memo } from 'react';

import { useTranslation } from 'react-i18next';

import {
    StyledRightIcon,
    StyledLeftIcon,
    StyledTextInput,
    StyledUnits,
    StyledTextField,
    StyledTextFieldWrapper,
} from './TextInput.styled';
import type { ITextInput } from './types';
import TextInputType from './types/TextInputType';
import { TEST_AID } from '../../../constants';
import { i18next } from '../../../services/translate';
import Adornment from '../../Adornment';
import FormControl from '../../FormControl/FormControl';
import { UNITS_MAX_CHARS } from '../constants';

const TextInput = forwardRef<HTMLDivElement, ITextInput>((props, parentRef) => {
    const {
        value,
        disabled = false,
        placeholder = '',
        type = TextInputType.TEXT,
        size = 'medium',
        fieldKey,
        min,
        max,
        units = null,
        leftIcon = null,
        rightIcon = null,
        title = '',
        error = false,
        message = '',
        required = false,
        autoFocus = false,
        autoSelect = false,
        autoComplete = 'off',
        endAdornment,
        maxLength = -1,
        legacyMode = false,
        highlightError = true,
        onChange,
        onMaskedChange,
        onBlur,
        onFocus,
        dataAid,
        'data-aid': id,
        fieldNameTooltip,
        showRequiredAsterisk = false,
        ariaLabel = '',
        ...restProps
    } = props;
    const { t } = useTranslation(undefined, { i18n: i18next });
    const inputRef = useRef<HTMLInputElement>(null);
    const onFocusHandle = useCallback(() => {
        onFocus && onFocus();
    }, [onFocus]);
    const onBlurHandle = useCallback(() => {
        onBlur && onBlur(value);
    }, [onBlur, value]);

    useEffect(() => {
        if (autoSelect && inputRef.current) {
            inputRef.current.select();
        }
    }, [autoSelect]);

    const onInputChange = useCallback(
        (e: ChangeEvent<HTMLInputElement>) =>
            onMaskedChange
                ? onMaskedChange(e)
                : onChange && onChange(e.target.value),
        [onChange, onMaskedChange]
    );

    const input = (
        <StyledTextInput
            {...{
                id: dataAid || id,
                ref: inputRef,
                placeholder,
                onChange: onInputChange,
                value,
                disabled,
                inputSize: size,
                type,
                units,
                onFocus: onFocusHandle,
                onBlur: onBlurHandle,
                autoFocus,
                autoComplete,
                maxLength,
                min,
                max,
                'aria-label': ariaLabel || title || t('ARIA_LABELS.TEXT_INPUT'),
                'data-aid': TEST_AID.TEXT_INPUT,
                'aria-describedby': fieldKey ? `error-${fieldKey}` : undefined,
            }}
        />
    );

    return (
        <FormControl
            {...{
                title,
                required,
                error,
                highlightError,
                message,
                endAdornment,
                size,
                legacyMode,
                dataAid: dataAid || id,
                tooltip: fieldNameTooltip,
                showRequiredAsterisk,
                fieldKey,
            }}
        >
            <StyledTextFieldWrapper className={error ? 'error-field' : ''}>
                <StyledTextField
                    {...{
                        ref: parentRef,
                        disabled,
                        inputSize: size,
                        ...restProps,
                    }}
                >
                    {input}
                    {leftIcon && (
                        <StyledLeftIcon size={size}>{leftIcon}</StyledLeftIcon>
                    )}
                    {units && (
                        <StyledUnits size={size}>
                            {units.slice(0, UNITS_MAX_CHARS)}
                        </StyledUnits>
                    )}
                    {rightIcon && (
                        <StyledRightIcon disabled={disabled} size={size}>
                            {rightIcon}
                        </StyledRightIcon>
                    )}
                </StyledTextField>
                {!legacyMode &&
                    endAdornment &&
                    Object.keys(endAdornment).length && (
                        <Adornment
                            tooltipMessage={endAdornment.tooltipMessage}
                            icon={endAdornment.icon}
                            size={size}
                            placement={endAdornment.placement}
                            tooltipPopperProps={endAdornment.tooltipPopperProps}
                            tooltipWidth={endAdornment.tooltipWidth}
                        />
                    )}
            </StyledTextFieldWrapper>
        </FormControl>
    );
});

export default memo(TextInput);
