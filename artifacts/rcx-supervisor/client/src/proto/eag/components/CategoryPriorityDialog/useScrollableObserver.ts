import { useEffect, useRef, useState } from 'react';

export const useScrollableObserver = () => {
    const dialogContentRef = useRef<HTMLDivElement>(null);
    const bottomDetectorRef = useRef<HTMLDivElement>(null);
    const [, setIsFirstRender] = useState(true);
    const [scrollable, setScrollable] = useState(false);

    const dialogContent = dialogContentRef.current;
    const bottomDetector = bottomDetectorRef.current;

    // Note: Don't remove it. It is to resolve the issue that dialog content ref is null at first render.
    useEffect(() => {
        setIsFirstRender(false);
    }, []);

    useEffect(() => {
        if (!dialogContent || !bottomDetector) return;

        const observer = new IntersectionObserver(
            /* istanbul ignore next */
            (entries) => {
                setScrollable(
                    !entries[0].isIntersecting || dialogContent.scrollTop > 0
                );
            },
            { root: dialogContentRef.current }
        );

        observer.observe(bottomDetector);

        return () => {
            observer.disconnect();
        };
    }, [bottomDetector, dialogContent]);

    return {
        dialogContentRef,
        bottomDetectorRef,
        scrollable,
    };
};
