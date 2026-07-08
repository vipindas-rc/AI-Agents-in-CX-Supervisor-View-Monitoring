export const isDocumentScrollContainer = (
    element: HTMLElement | null | undefined
): boolean => element === document.documentElement || element === document.body;

export const getScrollTop = (
    element: HTMLElement | null | undefined
): number => {
    if (!element) return 0;
    return isDocumentScrollContainer(element)
        ? window.scrollY
        : element.scrollTop;
};

export const scrollTo = (
    element: HTMLElement | null | undefined,
    top: number
): void => {
    if (!element) return;

    if (isDocumentScrollContainer(element)) {
        window.scrollTo({ top });
    } else {
        element.scrollTop = top;
    }
};

export const getScrollTarget = (element: HTMLElement): Window | HTMLElement => {
    return isDocumentScrollContainer(element) ? window : element;
};

export const calculateListOffset = (
    wrapper: HTMLElement,
    container: HTMLElement
): number => {
    const wrapperRect = wrapper.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    return wrapperRect.top - containerRect.top + container.scrollTop;
};

type ResizeObserverSetup = {
    observer: ResizeObserver;
    cleanup: () => void;
};

export const createResizeObserver = (
    element: HTMLElement,
    onResize: () => void
): ResizeObserverSetup => {
    let rafId: number | null = null;

    const observer = new ResizeObserver(() => {
        if (rafId !== null) {
            cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
            rafId = null;
            onResize();
        });
    });

    observer.observe(element);

    return {
        observer,
        cleanup: () => {
            if (rafId !== null) {
                cancelAnimationFrame(rafId);
            }
            observer.disconnect();
        },
    };
};
