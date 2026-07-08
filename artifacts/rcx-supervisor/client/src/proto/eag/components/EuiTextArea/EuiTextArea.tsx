import type { FC } from 'react';
import { useMemo } from 'react';

import {
    FormTextArea,
    BlinkingCursor,
    AnimatedText,
    InteractiveDots,
} from '@ringcx/ui';

import { StyledLoadingTextSpan, StyledParagraph } from './EuiTextArea.styled';
import type { IEuiFormTextAreaComponent } from './types';
import CreateAngularModule from '../../helpers/CreateAngularModule';

const EuiFormTextAreaComponent: FC<IEuiFormTextAreaComponent> = ({
    value,
    onChange,
    label,
    showOverlay,
    onAnimationEnd,
    animationDelay = 5,
    animationText = '',
    replacementCallback,
    isFinal = false,
    loading,
    loadingText,
    disabled,
    ...rest
}) => {
    const renderOverlay = useMemo(() => {
        if (!showOverlay) {
            return null;
        }

        return loading ? (
            <StyledParagraph>
                <StyledLoadingTextSpan>{loadingText}</StyledLoadingTextSpan>
                <InteractiveDots />
            </StyledParagraph>
        ) : (
            <StyledParagraph>
                <AnimatedText
                    text={animationText}
                    replacementCallback={replacementCallback}
                    onAnimationEnd={onAnimationEnd}
                    animationDelay={animationDelay}
                    isFinalTextChunk={isFinal}
                />
                <BlinkingCursor />
            </StyledParagraph>
        );
    }, [
        animationDelay,
        animationText,
        isFinal,
        loading,
        loadingText,
        onAnimationEnd,
        replacementCallback,
        showOverlay,
    ]);

    return (
        <FormTextArea
            title={label}
            value={value}
            onChange={onChange}
            showOverlay={showOverlay}
            overlayContent={renderOverlay}
            disabled={disabled || showOverlay}
            {...rest}
        ></FormTextArea>
    );
};
export default CreateAngularModule(
    'engageUiTextArea',
    EuiFormTextAreaComponent,
    [
        'label',
        'required',
        'value',
        'placeholder',
        'onChange',
        'error',
        'message',
        'onMaskedChange',
        'replacementCallback',
        'cols',
        'rows',
        'onFocus',
        'readonly',
        'disabled',
        'showOverlay',
        'animationText',
        'loading',
        'loadingText',
        'onAnimationEnd',
        'animationDelay',
        'isFinal',
    ],
    []
);
