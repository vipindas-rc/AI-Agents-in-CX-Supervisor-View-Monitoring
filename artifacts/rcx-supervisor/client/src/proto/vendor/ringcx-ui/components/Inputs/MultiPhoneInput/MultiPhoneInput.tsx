import type { BaseSyntheticEvent, ClipboardEvent, SyntheticEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete/Autocomplete';
import { parsePhoneNumber } from '@ringcx/shared';

import {
    StyledChip,
    StyledMultiPhoneInput,
    StyledTextInput,
} from './MultiPhoneInput.styled';
import type { MultiPhoneInputProps } from './types';
import type { IAdornment } from '../../Adornment/types';
import { FormControl } from '../../FormControl';

const DEFAULT_FORMAT_ERROR = 'Invalid format';
const DEFAULT_FORMAT_ERROR_LEGACY = 'invalid format';
const DEFAULT_PLACEHOLDER = 'Pipe or new line separated values';
const DEFAULT_REQUIRED_ERROR = 'required';
const HELP_MESSAGE =
    'Add a plus "+" before the phone number for international numbers';

type ParseResult = {
    isValid: boolean;
    value: string;
    displayValue: string;
};

// Exporting for testing purposes.
export function parse(
    rawValue: string,
    allowShortNumber?: boolean,
    allowE164Format?: boolean
): ParseResult {
    const { isValid, e164, value, isRCExtension, isSpecialNumber } =
        parsePhoneNumber(rawValue);
    const isShortNumber = isRCExtension || isSpecialNumber;
    const isTrulyValid = !allowShortNumber && isShortNumber ? false : isValid;

    return {
        isValid: isTrulyValid,
        displayValue: isValid ? value : rawValue,
        value:
            isValid && (allowE164Format === undefined || allowE164Format)
                ? e164
                : rawValue,
    };
}

function calculateInnerValues(
    value: string[],
    {
        allowShortNumbers,
        allowE164Format,
    }: { allowShortNumbers: boolean; allowE164Format: boolean }
): Map<string, ParseResult> {
    const innerValues = new Map();

    const uniqValues = Array.from(new Set(value));
    uniqValues.forEach((rawValue) => {
        const parseResult = parse(rawValue, allowShortNumbers, allowE164Format);
        innerValues.set(parseResult.displayValue, parseResult);
    });

    return innerValues;
}

const MultiPhoneInput = ({
    title,
    value = [],
    delimiters,
    maxChips = 6,
    placeholder = DEFAULT_PLACEHOLDER,
    required = false,
    requiredMessage = DEFAULT_REQUIRED_ERROR,
    legacyMode = true,
    allowShortNumbers = true,
    errorMessage = legacyMode
        ? DEFAULT_FORMAT_ERROR_LEGACY
        : DEFAULT_FORMAT_ERROR,
    helpMessage = HELP_MESSAGE,
    onChange,
    onError,
    allowE164Format = true,
    ariaLabelText,
    ...props
}: MultiPhoneInputProps) => {
    const [innerValues, setInnerValues] = useState<Map<string, ParseResult>>(
        () =>
            calculateInnerValues(value, { allowShortNumbers, allowE164Format })
    );
    const prevValue = useRef(value.join());
    const prevInnerValues = useRef(innerValues);
    const [inputValue, setInputValue] = useState('');
    const [readOnly, setReadOnly] = useState(false);
    const [firstFocusEmitted, setFirstFocusEmitted] = useState(false);

    const splitRegexp = useMemo(
        () => RegExp(`[${delimiters.join('')}]+`),
        [delimiters]
    );

    const message = useMemo(() => {
        if (required && !innerValues.size) {
            return requiredMessage;
        }

        for (const { isValid } of innerValues.values()) {
            if (!isValid) {
                return errorMessage;
            }
        }

        return '';
    }, [errorMessage, required, requiredMessage, innerValues]);

    const error = !!message;

    const displayValues = useMemo(
        () => Array.from(innerValues.keys()),
        [innerValues]
    );

    useEffect(() => {
        const currentValue = value.join();

        if (prevValue.current !== currentValue) {
            const innerValues = calculateInnerValues(value, {
                allowShortNumbers,
                allowE164Format,
            });

            prevValue.current = currentValue;
            setInnerValues(innerValues);
        }
    }, [allowShortNumbers, value, allowE164Format]);

    useEffect(() => {
        const isValueChanged = innerValues !== prevInnerValues.current;

        if (isValueChanged) {
            const values = [];

            for (const { value } of innerValues.values()) {
                values.push(value);
            }

            onChange(values, error);
        }
    }, [error, innerValues, onChange]);

    useEffect(() => {
        if (!onError || !error) {
            return;
        }

        const errorValues = [];

        for (const { isValid, displayValue } of innerValues.values()) {
            if (!isValid) {
                errorValues.push(displayValue);
            }
        }

        const hasRequiredError = required && !innerValues.size;
        const hasInvalidFormatError = !!errorValues.length;

        if (hasRequiredError || hasInvalidFormatError) {
            onError({
                isEmpty: hasRequiredError,
                isInvalid: hasInvalidFormatError,
                invalidValues: errorValues,
            });
        }
    }, [error, innerValues, onError, required]);

    useEffect(() => {
        setReadOnly(innerValues.size >= maxChips);
    }, [innerValues, maxChips]);

    useEffect(() => {
        prevInnerValues.current = innerValues;
    }, [innerValues]);

    const handleInputChange = useCallback(
        (e: SyntheticEvent, newValue: string) => {
            if (delimiters.some((delimiter) => newValue.includes(delimiter))) {
                const normalized = newValue
                    .split(splitRegexp)
                    .map((item) => item.trim())
                    .filter(Boolean);

                const parseResults = normalized.map((value) =>
                    parse(value, allowShortNumbers, allowE164Format)
                );

                parseResults.forEach((parseResult) => {
                    if (!innerValues.has(parseResult.displayValue)) {
                        innerValues.set(parseResult.displayValue, parseResult);
                    }
                });

                setInnerValues(new Map(innerValues));
                setInputValue('');
            } else {
                setInputValue(newValue);
            }
        },
        [
            allowShortNumbers,
            delimiters,
            innerValues,
            splitRegexp,
            allowE164Format,
        ]
    );

    const handleChange = useCallback(
        (e: SyntheticEvent | null, newValue: string[]) => {
            if (newValue.length === 0) {
                setInnerValues(new Map());
                return;
            }

            if (newValue.length < innerValues.size) {
                innerValues.forEach((_, displayValue) => {
                    if (!newValue.includes(displayValue)) {
                        innerValues.delete(displayValue);
                    }
                });

                setInnerValues(new Map(innerValues));
                return;
            }

            const parseResult = parse(
                newValue[newValue.length - 1],
                allowShortNumbers,
                allowE164Format
            );

            if (!innerValues.has(parseResult.displayValue)) {
                innerValues.set(parseResult.displayValue, parseResult);
                setInnerValues(new Map(innerValues));
            }
        },
        [allowShortNumbers, innerValues, allowE164Format]
    );

    const handlePaste = useCallback(
        (e: ClipboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const clipboardText = e.clipboardData.getData('Text');

            const normalized = clipboardText
                .split(splitRegexp)
                .map((item) => item.trim())
                .filter(Boolean);

            const parsedResults = normalized.map((value) =>
                parse(value, allowShortNumbers, allowE164Format)
            );

            for (const parsedResult of parsedResults) {
                if (!innerValues.has(parsedResult.displayValue)) {
                    innerValues.set(parsedResult.displayValue, parsedResult);
                }
            }

            const sliced = new Map(Array.from(innerValues).slice(0, maxChips));

            setInputValue('');
            setInnerValues(sliced);
        },
        [allowShortNumbers, innerValues, maxChips, splitRegexp, allowE164Format]
    );

    const handleBlur = useCallback(
        (e: BaseSyntheticEvent) => {
            if (e.target?.value) {
                const parseResult = parse(
                    e.target.value,
                    allowShortNumbers,
                    allowE164Format
                );

                if (innerValues.has(parseResult.displayValue)) {
                    return;
                }

                innerValues.set(parseResult.displayValue, parseResult);

                setInnerValues(new Map(innerValues));
                setInputValue('');
            }

            setFirstFocusEmitted((firstFocusEmitted) => {
                if (!firstFocusEmitted) {
                    return true;
                }
                return firstFocusEmitted;
            });
        },
        [allowShortNumbers, innerValues, allowE164Format]
    );

    const handleDelete = useCallback(
        (displayValue: string) => {
            innerValues.delete(displayValue);
            setInnerValues(new Map(innerValues));
        },
        [innerValues]
    );

    const handleRenderTags = useCallback(() => {
        return Array.from(displayValues).map((displayValue) => (
            <StyledChip
                key={displayValue}
                label={displayValue}
                onDelete={() => handleDelete(displayValue)}
            />
        ));
    }, [displayValues, handleDelete]);

    const renderInput = useCallback(
        (params: AutocompleteRenderInputParams) => {
            return (
                <StyledTextInput
                    {...{
                        ...params,
                        inputProps: {
                            ...params.inputProps,
                            readOnly,
                            'aria-label': ariaLabelText,
                        },
                        placeholder: innerValues.size ? '' : placeholder,
                    }}
                />
            );
        },
        [innerValues, placeholder, readOnly, ariaLabelText]
    );

    const endAdornment: Omit<IAdornment, 'legacyMode' | 'offset'> | undefined =
        useMemo(() => {
            if (helpMessage) {
                return {
                    tooltipMessage: helpMessage,
                    placement: 'right',
                    legacyMode,
                };
            }

            return undefined;
        }, [helpMessage, legacyMode]);

    return (
        <FormControl
            {...{ title, message, error, required, legacyMode, endAdornment }}
        >
            <StyledMultiPhoneInput
                inputValue={inputValue}
                onInputChange={handleInputChange}
                value={displayValues}
                onChange={handleChange}
                onPaste={handlePaste}
                onBlur={handleBlur}
                renderTags={handleRenderTags}
                renderInput={renderInput}
                error={error && firstFocusEmitted}
                {...props}
            />
        </FormControl>
    );
};

export default MultiPhoneInput;
