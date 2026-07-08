import type { FC } from 'react';
import { useCallback, useRef, useEffect, useState } from 'react';

import { Wrapper, StyledFormTextArea } from './MultiPhoneInput.styled';
import type { MultiPhoneInputProps } from './types';
import { MULTI_PHONE_INPUT } from '../../constants/testIds';
import CreateAngularModule from '../../helpers/CreateAngularModule';

const LINE_HEIGHT = 20;
const PADDING = 12;
const BORDER = 2;

export const MultiPhoneInput: FC<MultiPhoneInputProps> = ({
    label,
    value,
    onChange,
    onBlur,
    message,
    error,
    disabled,
    required,
    maxRows = -1,
}: MultiPhoneInputProps) => {
    const [rows, setRows] = useState(1);
    const containerRef = useRef<HTMLDivElement | null>(null);

    const calculateRows = useCallback(() => {
        const textarea = containerRef.current?.querySelector('textarea');
        if (!textarea) return;

        textarea.style.height = `${LINE_HEIGHT + PADDING + BORDER}px`;

        const contentHeight = textarea.scrollHeight - PADDING - BORDER;
        const newRows = Math.min(
            Math.max(Math.ceil(contentHeight / LINE_HEIGHT), 1),
            maxRows
        );

        textarea.style.height = `${LINE_HEIGHT * newRows + PADDING + BORDER}px`;
        setRows(newRows);
    }, [maxRows]);

    // Calculate rows when value changes
    useEffect(() => {
        calculateRows();
    }, [value, calculateRows]);

    const handleChange = (newValue: string) => {
        onChange(newValue);
    };

    return (
        <Wrapper error={error} ref={containerRef}>
            <StyledFormTextArea
                title={label}
                value={value}
                onChange={handleChange}
                onBlur={onBlur}
                error={error}
                message={message}
                disabled={disabled}
                required={required}
                dataAid={MULTI_PHONE_INPUT}
                rows={rows}
            />
        </Wrapper>
    );
};

export default CreateAngularModule('multiPhoneInput', MultiPhoneInput, [
    'label',
    'value',
    'maxRows',
    'onChange',
    'onBlur',
    'message',
    'error',
    'disabled',
    'required',
]);
