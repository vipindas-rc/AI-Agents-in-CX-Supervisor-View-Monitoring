import { css } from 'styled-components';

import { isActivationKey } from '../keyboard';

export const focusVisibleStyles = css`
    &:focus-visible {
        outline: 2px solid
            ${({ theme }) =>
                theme?.colors?.primary ??
                'var(--content-brand, #066fac)'} !important;
        outline-offset: 2px;
        border-radius: 4px;
    }
`;

/**
 * Focus-visible styles for elements inside containers with overflow: hidden.
 */
export const focusVisibleInsideOverflowStyles = css`
    &:focus-visible {
        outline: 2px solid
            ${({ theme }) =>
                theme?.colors?.primary ??
                'var(--content-brand, #066fac)'} !important;
        outline-offset: -2px;
        padding: 2px;
        border-radius: 4px;
    }
`;

/**
 * Can be used in non-styled-components contexts (e.g., AngularJS, vanilla JS).
 */
export const focusVisibleStylesPlain = `
    outline: 2px solid #066fac !important;
    outline-offset: 2px;
    border-radius: 4px;
`;

export const addKeyboardActivation = (
    element: HTMLElement | null,
    callback: (event: KeyboardEvent) => void
): (() => void) => {
    if (!element) {
        return () => {};
    }

    const handleKeyDown = (event: KeyboardEvent): void => {
        if (isActivationKey(event.key)) {
            event.preventDefault();
            event.stopPropagation();

            try {
                callback(event);
            } catch (error) {
                console.warn(
                    '[A11y] Keyboard activation callback failed:',
                    error
                );
            }
        }
    };

    try {
        element.addEventListener('keydown', handleKeyDown);
    } catch (error) {
        console.warn('[A11y] Failed to add keyboard listener:', error);
        return () => {};
    }

    return () => {
        try {
            element.removeEventListener('keydown', handleKeyDown);
        } catch (error) {
            console.warn('[A11y] Failed to remove keyboard listener:', error);
        }
    };
};
