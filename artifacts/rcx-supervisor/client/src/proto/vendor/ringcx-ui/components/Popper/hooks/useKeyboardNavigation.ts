import type { RefObject, KeyboardEvent } from 'react';
import { useState, useEffect, useCallback } from 'react';

const MENU_ITEM_SELECTOR =
    'li[role="menuitem"][tabindex], li[role="menuitem"] a[href], li[role="menuitem"] button:not([disabled]), li[role="menuitem"] [role="menuitem"], li[role="menuitem"] [role="button"]';

interface UseKeyboardNavigationOptions {
    menuRef: RefObject<HTMLDivElement>;
    toggleRef: RefObject<HTMLElement>;
    isOpen: boolean;
    closePopover: () => void;
    enabled: boolean;
}

interface UseKeyboardNavigationReturn {
    handleKeyDown: (event: KeyboardEvent<HTMLElement>) => void;
}

const focusToggleElement = (toggleRef: RefObject<HTMLElement>) => {
    if (!toggleRef.current) {
        return;
    }

    const focusableElement = toggleRef.current.querySelector<HTMLElement>(
        'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
    );
    if (focusableElement) {
        focusableElement.focus();
    } else {
        toggleRef.current.focus();
    }
};

export const useKeyboardNavigation = ({
    menuRef,
    toggleRef,
    isOpen,
    closePopover,
    enabled,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn => {
    const [focusedIndex, setFocusedIndex] = useState<number>(-1);

    const getFocusableElements = useCallback((): HTMLElement[] => {
        if (!menuRef.current || !enabled) {
            return [];
        }

        const elements = Array.from(
            menuRef.current.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR)
        );

        return elements.filter((el) => {
            const elStyle = window.getComputedStyle(el);
            if (elStyle.display === 'none' || elStyle.visibility === 'hidden') {
                return false;
            }

            let ancestor = el.parentElement;
            while (ancestor && ancestor !== menuRef.current) {
                const ancestorStyle = window.getComputedStyle(ancestor);
                if (
                    ancestorStyle.display === 'none' ||
                    ancestorStyle.visibility === 'hidden'
                ) {
                    return false;
                }
                ancestor = ancestor.parentElement;
            }

            return true;
        });
    }, [menuRef, enabled]);

    const focusElementAtIndex = useCallback(
        (index: number) => {
            const elements = getFocusableElements();
            if (elements.length === 0) {
                return;
            }

            const normalizedIndex =
                ((index % elements.length) + elements.length) % elements.length;
            const element = elements[normalizedIndex];

            if (element) {
                element.focus();
                setFocusedIndex(normalizedIndex);
            }
        },
        [getFocusableElements]
    );

    useEffect(() => {
        if (enabled && isOpen) {
            setTimeout(() => {
                focusElementAtIndex(0);
            }, 0);
        }
    }, [enabled, isOpen, focusElementAtIndex]);

    useEffect(() => {
        if (!isOpen) {
            setFocusedIndex(-1);
        }
    }, [isOpen]);

    useEffect(() => {
        if (!enabled || !isOpen) {
            return;
        }

        const handleGlobalKeyDown = (event: globalThis.KeyboardEvent) => {
            if (event.key === 'Tab') {
                focusToggleElement(toggleRef);
                closePopover();
            }
        };

        document.addEventListener('keydown', handleGlobalKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleGlobalKeyDown, true);
        };
    }, [enabled, isOpen, closePopover, toggleRef]);

    const handleKeyDown = useCallback(
        (event: KeyboardEvent<HTMLElement>) => {
            if (!enabled || !isOpen) {
                return;
            }

            const elements = getFocusableElements();
            if (elements.length === 0) {
                return;
            }

            switch (event.key) {
                case 'Tab':
                    focusToggleElement(toggleRef);
                    closePopover();
                    break;

                case 'ArrowDown':
                    event.preventDefault();
                    if (focusedIndex === -1) {
                        focusElementAtIndex(0);
                    } else {
                        focusElementAtIndex(focusedIndex + 1);
                    }
                    break;

                case 'ArrowUp':
                    event.preventDefault();
                    if (focusedIndex === -1) {
                        focusElementAtIndex(elements.length - 1);
                    } else {
                        focusElementAtIndex(focusedIndex - 1);
                    }
                    break;

                case 'Home':
                    event.preventDefault();
                    focusElementAtIndex(0);
                    break;

                case 'End':
                    event.preventDefault();
                    focusElementAtIndex(elements.length - 1);
                    break;

                case 'Escape':
                    event.preventDefault();
                    closePopover();
                    focusToggleElement(toggleRef);
                    break;

                case 'Enter':
                case ' ':
                    break;

                default:
                    break;
            }
        },
        [
            enabled,
            isOpen,
            focusedIndex,
            getFocusableElements,
            focusElementAtIndex,
            closePopover,
            toggleRef,
        ]
    );

    return { handleKeyDown };
};
