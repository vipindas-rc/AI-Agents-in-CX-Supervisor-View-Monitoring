import {
    type ReactNode,
    createContext,
    useContext,
    useRef,
    useCallback,
    useMemo,
    Children,
} from 'react';

interface SyncScrollContextType {
    registerElement: (element: HTMLElement) => void;
    unregisterElement: (element: HTMLElement) => void;
}

const SyncScrollContext = createContext<SyncScrollContextType | undefined>(
    undefined
);

interface SyncScrollProviderProps {
    children: ReactNode;
}

export const SyncScrollProvider: React.FC<SyncScrollProviderProps> = ({
    children,
}) => {
    const scrollElements = useRef<HTMLElement[]>([]);

    const removeEvents = useCallback((element: HTMLElement) => {
        element.onscroll = null;
    }, []);

    const addEvents = useCallback(
        (element: HTMLElement) => {
            element.onscroll = () => {
                requestAnimationFrame(() => {
                    scrollElements.current.forEach((el) => {
                        if (el !== element) {
                            removeEvents(el);
                            el.scrollLeft = element.scrollLeft;
                            requestAnimationFrame(() => {
                                addEvents(el);
                            });
                        }
                    });
                });
            };
        },
        [removeEvents]
    );

    const registerElement = useCallback(
        (element: HTMLElement) => {
            if (!scrollElements.current.includes(element)) {
                // Sync with existing elements if any
                if (scrollElements.current.length > 0) {
                    element.scrollLeft = scrollElements.current[0].scrollLeft;
                }
                scrollElements.current.push(element);
                addEvents(element);
            }
        },
        [addEvents]
    );

    const unregisterElement = useCallback(
        (element: HTMLElement) => {
            const index = scrollElements.current.indexOf(element);
            if (index !== -1) {
                removeEvents(element);
                scrollElements.current.splice(index, 1);
            }
        },
        [removeEvents]
    );

    const value: SyncScrollContextType = useMemo(
        () => ({
            registerElement,
            unregisterElement,
        }),
        [registerElement, unregisterElement]
    );

    return (
        <SyncScrollContext.Provider value={value}>
            {Children.only(children)}
        </SyncScrollContext.Provider>
    );
};

export const useSyncScrollContext = () => {
    const context = useContext(SyncScrollContext);
    if (context === undefined) {
        throw new Error(
            'useSyncScrollContext must be used within a SyncScrollProvider'
        );
    }
    return context;
};
