type BeforeUnloadListener = (
    event: BeforeUnloadEvent
) => void | string | undefined;

interface BeforeUnloadHelper {
    listeners: Set<BeforeUnloadListener>;
    addListener: (listener: BeforeUnloadListener) => void;
    removeListener: (listener: BeforeUnloadListener) => void;
    removeAllListeners: () => void;
    getListenerCount: () => number;
}

const beforeunloadHelper: BeforeUnloadHelper = {
    listeners: new Set<BeforeUnloadListener>(),

    addListener(listener: BeforeUnloadListener): void {
        if (typeof listener !== 'function') {
            throw new Error('Listener must be a function');
        }

        this.listeners.add(listener);
        window.addEventListener('beforeunload', listener);
    },

    removeListener(listener: BeforeUnloadListener): void {
        if (this.listeners.has(listener)) {
            window.removeEventListener('beforeunload', listener);
            this.listeners.delete(listener);
        }
    },

    removeAllListeners(): void {
        this.listeners.forEach((listener) => {
            window.removeEventListener('beforeunload', listener);
        });
        this.listeners.clear();
    },

    getListenerCount(): number {
        return this.listeners.size;
    },
};

export default beforeunloadHelper;
