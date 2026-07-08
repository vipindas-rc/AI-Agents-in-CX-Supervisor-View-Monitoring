import {
    ACTIVATION_KEYS,
    NAVIGATION_KEYS,
    EDITING_KEYS,
    DISMISSAL_KEYS,
    KEYBOARD_KEYS,
} from '../../constants';
import type {
    ActivationKey,
    NavigationKey,
    EditingKey,
    DismissalKey,
} from '../../constants';

export const isActivationKey = (key: string): key is ActivationKey => {
    return ACTIVATION_KEYS.includes(key as ActivationKey);
};

export const isNavigationKey = (key: string): key is NavigationKey => {
    return NAVIGATION_KEYS.includes(key as NavigationKey);
};

export const isEditingKey = (key: string): key is EditingKey => {
    return EDITING_KEYS.includes(key as EditingKey);
};

export const isDismissalKey = (key: string): key is DismissalKey => {
    return DISMISSAL_KEYS.includes(key as DismissalKey);
};

export const isEnterKey = (key: string): boolean => {
    return key === KEYBOARD_KEYS.ENTER;
};

export const isSpaceKey = (key: string): boolean => {
    return key === KEYBOARD_KEYS.SPACE;
};

export const isEscapeKey = (key: string): boolean => {
    return key === KEYBOARD_KEYS.ESCAPE;
};

export const isTabKey = (key: string): boolean => {
    return key === KEYBOARD_KEYS.TAB;
};

export const isArrowKey = (key: string): boolean => {
    const arrowKeys: string[] = [
        KEYBOARD_KEYS.ARROW_UP,
        KEYBOARD_KEYS.ARROW_DOWN,
        KEYBOARD_KEYS.ARROW_LEFT,
        KEYBOARD_KEYS.ARROW_RIGHT,
    ];
    return arrowKeys.includes(key);
};

export const isVerticalArrowKey = (key: string): boolean => {
    const verticalKeys: string[] = [
        KEYBOARD_KEYS.ARROW_UP,
        KEYBOARD_KEYS.ARROW_DOWN,
    ];
    return verticalKeys.includes(key);
};

export const isHorizontalArrowKey = (key: string): boolean => {
    const horizontalKeys: string[] = [
        KEYBOARD_KEYS.ARROW_LEFT,
        KEYBOARD_KEYS.ARROW_RIGHT,
    ];
    return horizontalKeys.includes(key);
};
