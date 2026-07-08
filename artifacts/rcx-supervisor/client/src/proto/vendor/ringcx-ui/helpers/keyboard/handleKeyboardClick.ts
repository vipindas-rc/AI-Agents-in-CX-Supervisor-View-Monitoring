import type { KeyboardEvent } from 'react';

import { isEnterKey, isSpaceKey } from './keyboard';
export const handleKeyboardClick = <T = Element>(
    callback: (event: KeyboardEvent<T>) => void
) => {
    return (event: KeyboardEvent<T>) => {
        if (
            (isEnterKey(event.key) || isSpaceKey(event.key)) &&
            event.target === event.currentTarget
        ) {
            event.preventDefault();
            event.stopPropagation();
            callback(event);
        }
    };
};
