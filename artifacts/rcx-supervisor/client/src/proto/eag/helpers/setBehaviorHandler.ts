import type { BehaviorSubject, Subscription } from 'rxjs';

const behaviorCache = new WeakMap<
    BehaviorSubject<unknown>,
    { value: unknown; unsubscribe: () => void }
>();

export function setBehaviorHandler<T>(
    bs: BehaviorSubject<T>,
    onChange?: (actual: T) => void
): { value: T; unsubscribe: () => void } {
    const cachedHandler = behaviorCache.get(bs as BehaviorSubject<unknown>);

    if (cachedHandler) {
        return cachedHandler as { value: T; unsubscribe: () => void };
    }

    let state: T = bs.getValue();
    let prev: T = state;

    const notify = (newValue: T) => {
        if (newValue !== prev) {
            prev = newValue;
            onChange?.(newValue);
        }
    };

    const subscription: Subscription = bs.subscribe((newValue: T) => {
        state = newValue;
        notify(newValue);
    });

    const handler = {
        get value() {
            return state;
        },
        unsubscribe: () => subscription.unsubscribe(),
    };

    behaviorCache.set(
        bs as BehaviorSubject<unknown>,
        handler as { value: unknown; unsubscribe: () => void }
    );
    return handler;
}
