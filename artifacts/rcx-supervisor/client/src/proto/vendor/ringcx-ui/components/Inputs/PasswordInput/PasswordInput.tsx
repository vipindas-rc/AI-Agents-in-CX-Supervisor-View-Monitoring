import { memo, useMemo, useState, useCallback } from 'react';

import { PassEye } from './components';
import { StyledPassword } from './PasswordInput.styled';
import type { IPasswordInput } from './types';
import { TextInput } from '../TextInput';
import TextInputType from '../TextInput/types/TextInputType';

const PasswordInput = ({
    value = '',
    size = 'medium',
    disabled = false,
    error = false,
    message = '',
    title = '',
    ...restProps
}: IPasswordInput) => {
    const [internalType, setInternalType] = useState(TextInputType.PASSWORD);

    const onClick = useCallback(() => {
        if (internalType === TextInputType.PASSWORD) {
            setInternalType(TextInputType.TEXT);
        } else {
            setInternalType(TextInputType.PASSWORD);
        }
    }, [internalType]);

    const passEye = useMemo(
        () =>
            !disabled &&
            value &&
            value.length > 0 && (
                <PassEye {...{ type: internalType, onClick }} />
            ),
        [disabled, value, internalType, onClick]
    );

    return (
        <StyledPassword>
            <TextInput
                {...{
                    value,
                    size,
                    type: internalType,
                    disabled,
                    error,
                    message,
                    title,
                    rightIcon: passEye,
                    ...restProps,
                }}
            />
        </StyledPassword>
    );
};

export default memo(PasswordInput);
