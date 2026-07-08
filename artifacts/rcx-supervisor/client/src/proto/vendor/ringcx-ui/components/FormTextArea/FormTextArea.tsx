import type { FC, ChangeEvent } from 'react';
import { useCallback, useMemo, useRef, useEffect } from 'react';

import { FormControl } from './../FormControl';
import { StyledOverlayContainer, StyledTextArea } from './FormTextArea.styled';
import type { IFormTextArea } from './types';

const FormTextArea: FC<IFormTextArea & { className?: string }> = (
    {
        title = '',
        required,
        value,
        placeholder,
        onChange,
        error = false,
        message = '',
        onMaskedChange,
        cols,
        rows,
        onFocus,
        onBlur,
        readonly = false,
        disabled = false,
        showOverlay = false,
        overlayContent = null,
        dataAid,
        maxLength = -1,
        fieldNameTooltip,
        className,
    },
    ...restProps
) => {
    const overlayContainerRef = useRef<HTMLDivElement>(null);

    const onChangeTextArea = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) =>
            onMaskedChange
                ? onMaskedChange(e)
                : onChange && onChange(e.target.value),
        [onChange, onMaskedChange]
    );

    const onBlurTextArea = useCallback(
        (e: ChangeEvent<HTMLTextAreaElement>) => {
            onBlur && onBlur(e.target.value);
        },
        [onBlur]
    );

    const scrollToBottom = (el: Nullable<HTMLElement>) => {
        if (el) {
            el.scrollTo(0, el.scrollHeight);
        }
    };

    const mutationCallback = useCallback((mutationList: MutationRecord[]) => {
        for (const mutation of mutationList) {
            if (
                mutation.type === 'characterData' ||
                mutation.type === 'childList'
            ) {
                scrollToBottom(overlayContainerRef.current);
            }
        }
    }, []);

    useEffect(() => {
        const observerRefValue = overlayContainerRef.current;
        const mutationObserver = new MutationObserver(mutationCallback);

        if (observerRefValue) {
            mutationObserver.observe(overlayContainerRef.current, {
                subtree: true,
                characterData: true,
                childList: true,
            });
        }
        return () => {
            mutationObserver.disconnect();
        };
    }, [overlayContainerRef, mutationCallback]);

    const loadingOverlay = useMemo(() => {
        return (
            showOverlay && (
                <StyledOverlayContainer ref={overlayContainerRef} title={title}>
                    {overlayContent}
                </StyledOverlayContainer>
            )
        );
    }, [overlayContent, showOverlay, title]);

    return (
        <FormControl
            title={title}
            required={required}
            error={error}
            message={message}
            dataAid={dataAid}
            tooltip={fieldNameTooltip}
            fieldKey={'text-area-message-key'}
        >
            {loadingOverlay}
            <StyledTextArea
                {...{
                    ref: scrollToBottom,
                    value,
                    onChange: onChangeTextArea,
                    placeholder,
                    onFocus,
                    onBlur: onBlurTextArea,
                    error,
                    cols,
                    rows,
                    readonly,
                    onMaskedChange,
                    disabled: disabled || showOverlay,
                    maxLength,
                    className,
                    ...restProps,
                    ...(dataAid ? { 'data-aid': `${dataAid}_textarea` } : {}),
                    'aria-label': title,
                    ...(error
                        ? { 'aria-describedby': 'error-text-area-message-key' }
                        : {}),
                }}
            />
        </FormControl>
    );
};

export default FormTextArea;
