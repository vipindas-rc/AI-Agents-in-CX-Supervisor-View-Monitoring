import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { useRifm } from 'rifm';

import type { ISimplePhoneInput } from './types';
import { TextInput } from '../TextInput';

const cleanNumber = (value: string): string =>
    value.replace(/\D/g, '').substr(0, 10);

const mapString = (text: string, map: string, placeholder = '_'): string => {
    let index = 0;
    let value = '';

    map.split('').forEach((x) => {
        value += x !== 'd' ? x : text[index++] || placeholder;
    });

    return value;
};

const formatNumber = (value: string): string => {
    const number = cleanNumber(value);
    return number ? mapString(number, '(ddd) ddd-dddd') : '';
};

const DEFAULT_ERROR = 'Invalid format';

const SimplePhoneInput: FC<ISimplePhoneInput> = ({
    value,
    error = false,
    message: messageProp = '',
    errorMessage = DEFAULT_ERROR,
    onChange: onChangeProp,
    onBlur: onBlurProp,
    onError,
    placeholder,
    ...props
}) => {
    const [hasError, setHasError] = useState<boolean>(
        () => value.length > 0 && value.length < 10
    );

    const onChange = useCallback(
        (value: string) => {
            setHasError(false);
            onChangeProp && onChangeProp(cleanNumber(value));
        },
        [onChangeProp]
    );

    const { value: formattedValue, onChange: setFormattedValue } = useRifm({
        value,
        onChange,
        format: formatNumber,
        accept: /[\d_]/g,
        mask: true,
    });

    const onBlur = useCallback(() => {
        onBlurProp && onBlurProp(value);
        setHasError(value.length > 0 && value.length < 10);
    }, [onBlurProp, value]);

    useEffect(() => {
        hasError &&
            onError &&
            onError({
                isInvalid: hasError,
            });
    }, [hasError, onError]);

    return (
        <TextInput
            value={formattedValue}
            placeholder={placeholder}
            error={error || hasError}
            message={hasError ? errorMessage : messageProp}
            onMaskedChange={setFormattedValue}
            onBlur={onBlur}
            {...props}
        />
    );
};

export default SimplePhoneInput;
