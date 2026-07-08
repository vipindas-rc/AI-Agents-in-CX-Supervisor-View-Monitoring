export const KEYBOARD_KEYS = {
    ENTER: 'Enter',
    SPACE: ' ',
    ESCAPE: 'Escape',
    TAB: 'Tab',
    ARROW_UP: 'ArrowUp',
    ARROW_DOWN: 'ArrowDown',
    ARROW_LEFT: 'ArrowLeft',
    ARROW_RIGHT: 'ArrowRight',
    BACKSPACE: 'Backspace',
    DELETE: 'Delete',
    HOME: 'Home',
    END: 'End',
    PAGE_UP: 'PageUp',
    PAGE_DOWN: 'PageDown',
} as const;

export const ACTIVATION_KEYS = [
    KEYBOARD_KEYS.ENTER,
    KEYBOARD_KEYS.SPACE,
] as const;

export const NAVIGATION_KEYS = [
    KEYBOARD_KEYS.ARROW_UP,
    KEYBOARD_KEYS.ARROW_DOWN,
    KEYBOARD_KEYS.ARROW_LEFT,
    KEYBOARD_KEYS.ARROW_RIGHT,
    KEYBOARD_KEYS.HOME,
    KEYBOARD_KEYS.END,
    KEYBOARD_KEYS.PAGE_UP,
    KEYBOARD_KEYS.PAGE_DOWN,
] as const;

export const EDITING_KEYS = [
    KEYBOARD_KEYS.BACKSPACE,
    KEYBOARD_KEYS.DELETE,
] as const;

export const DISMISSAL_KEYS = [KEYBOARD_KEYS.ESCAPE] as const;

export type KeyboardKey = (typeof KEYBOARD_KEYS)[keyof typeof KEYBOARD_KEYS];
export type ActivationKey = (typeof ACTIVATION_KEYS)[number];
export type NavigationKey = (typeof NAVIGATION_KEYS)[number];
export type EditingKey = (typeof EDITING_KEYS)[number];
export type DismissalKey = (typeof DISMISSAL_KEYS)[number];
