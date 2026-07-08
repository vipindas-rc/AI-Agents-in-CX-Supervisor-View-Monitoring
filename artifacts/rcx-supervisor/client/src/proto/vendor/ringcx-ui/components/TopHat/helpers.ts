import type { MutableRefObject } from 'react';

import { TopHatPriorities } from './constants';
import type {
    BuildNewTopHatFunction,
    ITopHatMessage,
    ITopHatOptions,
    ITopHatState,
} from './types';
import { FlatRef } from '../../types/FlatRef';
import { NotificationTypes } from '../constants/Notifications';
import type { INotificationType } from '../constants/types';

/** Find the active member of the queue. */
const findActive = (s: FlatRef<ITopHatState>): number | undefined =>
    Object.keys(s.deref.queue)
        .map((a) => parseInt(a, 10))
        .sort((a, b) => b - a)[0];

/** Update the `current` field in tophat state. */
function updateCurrent(state: FlatRef<ITopHatState>): FlatRef<ITopHatState> {
    const active = findActive(state);

    if (active === undefined) {
        state.deref.current = null;
        return new FlatRef(state);
    }

    const current = state.deref.queue[active][0];

    if (current === state.deref.current) {
        return state;
    }

    state.deref.current = current;

    return new FlatRef(state);
}

/** Insert a message into the queue. */
export function insertMessage(
    state: FlatRef<ITopHatState>,
    message: ITopHatMessage
): FlatRef<ITopHatState> {
    const { text, options = {} } = message;

    // If there's no priority provided, deduce it from type or assign default.
    if (!options.priority) {
        options.priority = options.type
            ? TopHatPriorities[options.type]
            : TopHatPriorities.info;
    }

    const entry = state.deref.queue[options.priority] ?? [];
    state.deref.queue[options.priority] = [{ text, options }, ...entry];

    return updateCurrent(state);
}

/** Pop current message from the queue. */
export function popMessage(
    state: FlatRef<ITopHatState>
): FlatRef<ITopHatState> {
    const activePriority = findActive(state);

    if (activePriority === undefined) {
        return state;
    }

    const entry = state.deref.queue[activePriority].slice(1);

    if (!entry.length) {
        delete state.deref.queue[activePriority];
        return updateCurrent(new FlatRef(state));
    }

    state.deref.queue[activePriority] = entry;
    return updateCurrent(state);
}

/** Handle the close delay on tophat message if state has changed.  */
export function handleDelay(
    state: FlatRef<ITopHatState>,
    t: MutableRefObject<number | null>,
    callback: () => unknown
) {
    const { timeout } = state.deref.current?.options ?? {};

    if (t.current) {
        window.clearTimeout(t.current);
        t.current = null;
    }

    if (timeout) {
        t.current = window.setTimeout(() => {
            callback();
            t.current = null;
        }, timeout * 1000);
    }
}

export const buildTopHatType =
    (type: INotificationType['type'], callback: BuildNewTopHatFunction) =>
    (message: string, options?: ITopHatOptions) =>
        callback(message, { ...options, type });

/**
 * Create tophat actions from state, update function and a timeout reference.
 */
export function topHatHelpers(
    state: FlatRef<ITopHatState>,
    update: (x: FlatRef<ITopHatState>) => void,
    t: MutableRefObject<number | null>
) {
    const pop = () => {
        const nextState = popMessage(state);
        handleDelay(state, t, pop);
        update(nextState);
    };

    const push: BuildNewTopHatFunction = (text, options) => {
        const nextState = insertMessage(state, { text, options });
        handleDelay(state, t, pop);
        update(nextState);
    };

    return {
        push,
        pop,
        state,
        success: buildTopHatType(NotificationTypes.SUCCESS, push),
        error: buildTopHatType(NotificationTypes.ERROR, push),
        warning: buildTopHatType(NotificationTypes.WARNING, push),
        info: buildTopHatType(NotificationTypes.INFO, push),
    };
}
