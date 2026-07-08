import { useRef } from 'react';

export function useGrayMatchResultTip(
    showGrayMatchResultTip: boolean,
    matchItems: any[]
) {
    const shouldShowGrayMatchResultTip = useRef(false);

    if (showGrayMatchResultTip || matchItems.length === 1) {
        shouldShowGrayMatchResultTip.current = true;
    }

    return shouldShowGrayMatchResultTip.current;
}
