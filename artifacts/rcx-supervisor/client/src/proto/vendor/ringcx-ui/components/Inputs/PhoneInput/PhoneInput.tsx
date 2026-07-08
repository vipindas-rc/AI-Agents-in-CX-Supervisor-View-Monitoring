import { useCallback, useEffect, useMemo, useRef, useState, memo } from 'react';

import { parsePhoneNumber } from '@ringcx/shared';

import {
    LegacyTextStyled,
    StyledP,
    StyledPhoneTextInput,
} from './PhoneInput.styled';
import type { PhoneInputType } from './types';
import type { IAdornment } from '../../Adornment/types';

// TODO better replace it to use i18n-translation when all engage-ui will be moving to support translation
const DEFAULT_ERROR = 'Invalid format';
const DEFAULT_ERROR_LEGACY = 'invalid format';
const REQUIRED_ERROR = 'This field is required';
const HELP_MESSAGE =
    'Add a plus "+" before the phone number for international numbers';
const UNSUPPORTED_COUNTRY_RESTRICTION_ERROR = 'Unsupported country code';
const UNSUPPORTED_COUNTRY_RESTRICTION_ERROR_LEGACY = 'unsupported country code';
const DEFAULT_PLACEHOLDER = 'Phone number';

function isAvailableCountryId(
    countryId: number,
    availableCountryIds?: number[]
): boolean {
    return (
        !Array.isArray(availableCountryIds) ||
        availableCountryIds.includes(countryId)
    );
}

const PhoneInput = ({
    value: valueProp,
    availableCountryIds,
    enableValidation = true,
    allowShortNumber = true,
    legacyMode = false,
    required = false,
    disabled = false,
    forceParse = true,
    error = false,
    message: messageProp = '',
    placeholder = DEFAULT_PLACEHOLDER,
    requiredMessage = REQUIRED_ERROR,
    errorMessage = legacyMode ? DEFAULT_ERROR_LEGACY : DEFAULT_ERROR,
    countryRestrictionMessage = legacyMode
        ? UNSUPPORTED_COUNTRY_RESTRICTION_ERROR_LEGACY
        : UNSUPPORTED_COUNTRY_RESTRICTION_ERROR,
    helpMessage = HELP_MESSAGE,
    onChange: onChangeProp,
    onError,
    size = 'small',
    enableCalculateOnDisable = false,
    placement = 'right',
    onBlur: onBlurProp,
    showRequiredAsterisk = false,
    ...restProps
}: PhoneInputType) => {
    const [hasRequiredError, setHasRequiredError] = useState<boolean>(false);
    const [hasError, setHasError] = useState<boolean>(false);
    const [hasCountryRestrictionError, setCountryRestrictionError] =
        useState<boolean>(false);
    const [firstFocusEmitted, setFirstFocusEmitted] = useState<boolean>(false);
    const [initCalculationDone, setInitCalculationDone] =
        useState<boolean>(false);
    const prevValue = useRef<string>('');
    const isOriginalE164Valid = useRef<boolean>(false);

    const [value, setValue] = useState<string>(() => {
        const { value, e164, isValid } = parsePhoneNumber(valueProp, {
            forceParse: false,
            useReductionToE164: false,
        });
        prevValue.current = isValid ? e164 : valueProp;
        isOriginalE164Valid.current = isValid;
        return value;
    });

    const message = useMemo(() => {
        if (hasError) {
            return errorMessage;
        }

        if (
            (legacyMode && required && !value) ||
            (((legacyMode && firstFocusEmitted) || (!legacyMode && error)) &&
                hasRequiredError)
        ) {
            return requiredMessage;
        }

        if (hasCountryRestrictionError) {
            return countryRestrictionMessage;
        }

        return legacyMode ? '' : messageProp;
    }, [
        hasError,
        legacyMode,
        required,
        value,
        firstFocusEmitted,
        error,
        hasRequiredError,
        hasCountryRestrictionError,
        messageProp,
        errorMessage,
        requiredMessage,
        countryRestrictionMessage,
    ]);

    const calculate = useCallback(
        (originalValue: string) => {
            const {
                value: formattedPhoneNumber,
                isValid,
                isEmpty,
                e164,
                countryId,
                isRCExtension,
                isSpecialNumber,
            } = parsePhoneNumber(originalValue, {
                forceParse: forceParse && firstFocusEmitted,
                useReductionToE164:
                    firstFocusEmitted || isOriginalE164Valid.current,
            });
            let anyError = false;
            let forceUpdate = false;

            const isShortNumber = isRCExtension || isSpecialNumber;
            const isRequiredError = required && isEmpty;
            const isValidError =
                enableValidation &&
                (!isValid || (!allowShortNumber && isShortNumber));

            if (!disabled || enableCalculateOnDisable) {
                anyError = (isRequiredError && legacyMode) || isValidError;

                setHasRequiredError((prevError) => {
                    forceUpdate = forceUpdate || prevError !== isRequiredError;
                    return isRequiredError;
                });
                setHasError((prevError) => {
                    forceUpdate = forceUpdate || prevError !== isValidError;
                    return isValidError;
                });

                if (isValid && !isEmpty && !isShortNumber) {
                    const isCountryRestrictionError = !isAvailableCountryId(
                        countryId,
                        availableCountryIds
                    );

                    anyError = anyError || isCountryRestrictionError;
                    setCountryRestrictionError((prevError) => {
                        forceUpdate =
                            forceUpdate ||
                            prevError !== isCountryRestrictionError;
                        return isCountryRestrictionError;
                    });
                }

                setInitCalculationDone(true);
            } else {
                setHasRequiredError(false);
                setHasError(false);
                setCountryRestrictionError(false);
                setFirstFocusEmitted(false);
                setInitCalculationDone(false);
            }

            const newValue = isValid ? e164 : originalValue;
            const isValueChanged = newValue !== prevValue.current;

            setValue(formattedPhoneNumber);
            if (isValueChanged || forceUpdate) {
                prevValue.current = newValue;

                initCalculationDone &&
                    onChangeProp &&
                    onChangeProp(
                        !isValueChanged && forceUpdate
                            ? originalValue
                            : newValue,
                        anyError
                    );
            }
        },
        [
            forceParse,
            firstFocusEmitted,
            required,
            enableValidation,
            allowShortNumber,
            disabled,
            enableCalculateOnDisable,
            legacyMode,
            availableCountryIds,
            initCalculationDone,
            onChangeProp,
        ]
    );

    const onChange = useCallback((value: string) => {
        setValue(value);
        setHasError(false);
        setHasRequiredError(false);
        setCountryRestrictionError(false);
        // onChange prop is not getting called from the calculate function
        // as value change is dependent on the onChange prop
        // so we need to call it here to ensure that the value is updated
        onChangeProp?.(value, false);
    }, []);

    const onBlur = useCallback(
        (value: string) => {
            setFirstFocusEmitted((firstFocusEmitted) => {
                if (!firstFocusEmitted) {
                    return true;
                }
                return firstFocusEmitted;
            });
            calculate(value);
            onBlurProp?.(value);
        },
        [calculate, onBlurProp]
    );

    // Order is IMPORTANT
    // Error effects have more high execution order then recalculate effect
    useEffect(() => {
        if (
            hasError ||
            (hasRequiredError && legacyMode) ||
            hasCountryRestrictionError
        ) {
            onError &&
                onError({
                    isInvalid: hasError,
                    isEmpty: hasRequiredError,
                    isUnavailableCountryId: hasCountryRestrictionError,
                });
        }
    }, [
        hasCountryRestrictionError,
        hasError,
        hasRequiredError,
        legacyMode,
        onError,
    ]);

    useEffect(() => {
        calculate(valueProp);
    }, [valueProp, calculate]);

    const endAdornment: Omit<IAdornment, 'legacyMode' | 'offset'> | undefined =
        useMemo(() => {
            let message: string | JSX.Element[] = '';
            if (helpMessage) {
                message = helpMessage
                    .split('\n')
                    .map((line, i) => <StyledP key={i}>{line}</StyledP>);
                return {
                    tooltipMessage: message,
                    size,
                    placement,
                    legacyMode,
                };
            }
            return undefined;
        }, [helpMessage, legacyMode, placement, size]);

    const legacyText = useMemo(() => {
        if (!legacyMode || !messageProp) {
            return null;
        }

        return (
            <LegacyTextStyled id='legacy-text'>{messageProp}</LegacyTextStyled>
        );
    }, [legacyMode, messageProp]);

    return (
        <div>
            <StyledPhoneTextInput
                {...{
                    error:
                        error ||
                        hasError ||
                        (legacyMode && firstFocusEmitted && hasRequiredError) ||
                        hasCountryRestrictionError,
                    message,
                    required: !disabled && required,
                    value,
                    onBlur,
                    onChange,
                    legacyMode,
                    endAdornment,
                    placeholder,
                    disabled,
                    size,
                    showRequiredAsterisk,
                    ...restProps,
                }}
            />
            {legacyText}
        </div>
    );
};

export default memo(PhoneInput);
