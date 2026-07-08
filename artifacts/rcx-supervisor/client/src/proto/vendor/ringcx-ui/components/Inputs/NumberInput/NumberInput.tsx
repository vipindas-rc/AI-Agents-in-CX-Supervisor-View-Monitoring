import { Rifm } from 'rifm';

import {
    DEFAULT_MAX_LENGTH,
    DEFAULT_MAX_VALUE,
    DEFAULT_MIN_VALUE,
} from './constants';
import type { INumberInput } from './types';
import TextInput from '../TextInput/TextInput';
import TextInputType from '../TextInput/types/TextInputType';

const NumberInput = ({
    value,
    onChange,
    disabled = false,
    size = 'medium',
    units = null,
    rightIcon = null,
    maxLength = DEFAULT_MAX_LENGTH,
    min = DEFAULT_MIN_VALUE,
    max = DEFAULT_MAX_VALUE,
    ...restProps
}: INumberInput) => {
    const parseInteger = (str: string) =>
        (str.match(/\d+/g) || []).join('').slice(0, maxLength);

    const handleOnBlur = (str: string) => {
        const parsed = parseInt(formatInteger(str));
        const result =
            parsed > max
                ? max.toString()
                : parsed < min
                  ? min.toString()
                  : formatInteger(str);
        onChange(result);
    };

    const formatInteger = (str: string) => {
        const parsed = parseInteger(str);
        const num = Number.parseInt(parsed, 10) || 0;
        return num.toString();
    };

    return (
        <Rifm value={value} onChange={onChange} format={formatInteger}>
            {({ value: rifmValue, onChange: onMaskedChange }) => (
                <TextInput
                    {...{
                        useMask: true,
                        onMaskedChange,
                        value: rifmValue,
                        disabled,
                        size,
                        type: TextInputType.TEXT,
                        units,
                        rightIcon,
                        onBlur: handleOnBlur,
                        ...restProps,
                    }}
                />
            )}
        </Rifm>
    );
};

export default NumberInput;
