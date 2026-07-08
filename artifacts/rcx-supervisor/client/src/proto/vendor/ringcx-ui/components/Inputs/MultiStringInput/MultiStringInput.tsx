import type { BaseSyntheticEvent, ClipboardEvent, SyntheticEvent } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import type { AutocompleteRenderInputParams } from '@mui/material/Autocomplete/Autocomplete';
import { useTranslation } from 'react-i18next';

import {
    StyledChip,
    StyledMultiStringInput,
    StyledTextInput,
} from './MultiStringInput.styled';
import type { MultiStringInputProps } from './types';
import { i18next } from '../../../services/translate';
import type { IAdornment } from '../../Adornment/types';
import { FormControl } from '../../FormControl';

function calculateInnerValues(value: string[]): Set<string> {
    const innerValues = new Set<string>();

    const uniqValues = Array.from(new Set(value));
    uniqValues.forEach((rawValue) => {
        if (rawValue.trim() !== '') {
            innerValues.add(rawValue);
        }
    });

    return innerValues;
}

const MultiStringInput = ({
    title,
    value = [],
    delimiters,
    maxChips = 6,
    maxHeight,
    placeholder,
    required = false,
    requiredMessage,
    legacyMode = true,
    helpMessage,
    onChange,
    onError,
    ...props
}: MultiStringInputProps) => {
    const [innerValues, setInnerValues] = useState<Set<string>>(() =>
        calculateInnerValues(value)
    );
    const prevValue = useRef(value.join());
    const prevInnerValues = useRef(innerValues);
    const [inputValue, setInputValue] = useState('');
    const [readOnly, setReadOnly] = useState(false);
    const [firstFocusEmitted, setFirstFocusEmitted] = useState(false);
    const [inputFocused, setInputFocused] = useState(false);
    const { t } = useTranslation(undefined, { i18n: i18next });

    const splitRegexp = useMemo(
        () => RegExp(`[${delimiters.join('')}]+`),
        [delimiters]
    );

    const message = useMemo(() => {
        if (required && !innerValues.size && !inputFocused) {
            return requiredMessage;
        }
        return '';
    }, [required, requiredMessage, innerValues, inputFocused]);

    const error = required && !innerValues.size;

    const displayValues = useMemo(() => Array.from(innerValues), [innerValues]);

    useEffect(() => {
        const currentValue = value.join();

        if (prevValue.current !== currentValue) {
            const innerValues = calculateInnerValues(value);

            prevValue.current = currentValue;
            setInnerValues(innerValues);
        }
    }, [value]);

    useEffect(() => {
        const isValueChanged = innerValues !== prevInnerValues.current;

        if (isValueChanged) {
            const values = Array.from(innerValues);
            onChange(values, error);
        }
    }, [error, innerValues, onChange]);

    useEffect(() => {
        if (!onError || !error) {
            return;
        }
        const hasRequiredError = required && !innerValues.size;

        if (hasRequiredError) {
            onError({
                isEmpty: hasRequiredError,
                invalidValues: Array.from(innerValues),
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

                const newInnerValues = new Set(innerValues);
                normalized.forEach((value) => {
                    newInnerValues.add(value);
                });

                setInnerValues(newInnerValues);
                setInputValue('');
            } else {
                setInputValue(newValue);
            }
        },
        [delimiters, innerValues, splitRegexp]
    );

    const handleChange = useCallback(
        (e: SyntheticEvent | null, newValue: string[]) => {
            if (newValue.length === 0) {
                setInnerValues(new Set());
                return;
            }

            if (newValue.length < innerValues.size) {
                const newInnerValues = new Set<string>();
                newValue.forEach((value) => {
                    if (innerValues.has(value)) {
                        newInnerValues.add(value);
                    }
                });
                setInnerValues(newInnerValues);
                return;
            }

            const valueStr = newValue[newValue.length - 1];
            if (
                valueStr &&
                valueStr.trim() !== '' &&
                !innerValues.has(valueStr)
            ) {
                const newInnerValues = new Set(innerValues);
                newInnerValues.add(valueStr);
                setInnerValues(newInnerValues);
            }
        },
        [innerValues]
    );

    const handlePaste = useCallback(
        (e: ClipboardEvent) => {
            e.preventDefault();
            e.stopPropagation();

            const clipboardText = e.clipboardData.getData('text/plain');

            const normalized = clipboardText
                .split(splitRegexp)
                .map((item) => item.trim())
                .filter(Boolean);

            const newInnerValues = new Set(innerValues);
            for (const valueStr of normalized) {
                if (!innerValues.has(valueStr)) {
                    newInnerValues.add(valueStr);
                }
            }

            const sliced = new Set(
                Array.from(newInnerValues).slice(0, maxChips)
            );

            setInputValue('');
            setInnerValues(sliced);
        },
        [innerValues, maxChips, splitRegexp]
    );

    const handleInputFocus = useCallback(() => {
        setInputFocused(true);
    }, []);

    const handleBlur = useCallback(
        (e: BaseSyntheticEvent) => {
            setInputFocused(false);
            if (e.target?.value) {
                const valueStr = e.target.value.trim();

                if (valueStr && !innerValues.has(valueStr)) {
                    const newInnerValues = new Set(innerValues);
                    newInnerValues.add(valueStr);
                    setInnerValues(newInnerValues);
                    setInputValue('');
                }
            }

            setFirstFocusEmitted((firstFocusEmitted) => {
                if (!firstFocusEmitted) {
                    return true;
                }
                return firstFocusEmitted;
            });
        },
        [innerValues]
    );

    const handleDelete = useCallback(
        (value: string) => {
            const newInnerValues = new Set(innerValues);
            newInnerValues.delete(value);
            setInnerValues(newInnerValues);

            if (!firstFocusEmitted) {
                setFirstFocusEmitted((firstFocusEmitted) => {
                    if (!firstFocusEmitted) {
                        return true;
                    }
                    return firstFocusEmitted;
                });
            }
        },
        [innerValues, firstFocusEmitted]
    );

    const handleRenderTags = useCallback(() => {
        return displayValues.map((displayValue) => (
            <StyledChip
                key={displayValue}
                label={displayValue}
                onDelete={() => handleDelete(displayValue)}
                id='multi-value-input-chip'
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
                            id: 'input-for-multi-value',
                            readOnly,
                            'aria-label': t('ARIA_LABELS.MULTI_VALUE_INPUT'),
                        },
                        placeholder: innerValues.size ? '' : placeholder,
                        onFocus: handleInputFocus,
                        onBlur: handleBlur,
                    }}
                />
            );
        },
        [innerValues, placeholder, readOnly, handleInputFocus, handleBlur, t]
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
            {...{
                title,
                message: (firstFocusEmitted && message) || '',
                error,
                required,
                legacyMode,
                endAdornment,
            }}
        >
            <StyledMultiStringInput
                inputValue={inputValue}
                onInputChange={handleInputChange}
                value={displayValues}
                onChange={handleChange}
                onPaste={handlePaste}
                onBlur={handleBlur}
                renderTags={handleRenderTags}
                renderInput={renderInput}
                error={error && firstFocusEmitted}
                maxHeight={maxHeight}
                {...props}
            />
        </FormControl>
    );
};

export default MultiStringInput;
