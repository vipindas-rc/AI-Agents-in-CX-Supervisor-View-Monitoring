const cache = new Map<string, any>();

export const cacheTickets = {
    get: (key: string) => {
        return cache.get(key);
    },
    set: (key: string, value: any) => {
        cache.set(key, value);
    },
    delete: (key: string) => {
        cache.delete(key);
    },
    clear: () => {
        cache.clear();
    },
};
