import { useEffect, useState } from 'react';

/**
 * For usage with applications using hash routing
 *
 * @returns current browser hash value
 */
export const useHashWatcher = () => {
    const [currentHash, setCurrentHash] = useState<string>(
        window.location.hash
    );

    // track the url hash for changes, these will determine which nav items are marked active
    const hashChanged = () => {
        setCurrentHash(window.location.hash);
    };

    useEffect(() => {
        window.addEventListener('hashchange', hashChanged);

        return () => {
            window.removeEventListener('hashchange', hashChanged);
        };
    }, []);

    return currentHash;
};
