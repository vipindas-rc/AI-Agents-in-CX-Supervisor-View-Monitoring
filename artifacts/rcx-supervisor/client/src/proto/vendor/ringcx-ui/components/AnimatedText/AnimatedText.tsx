import type { FC } from 'react';
import {
    useRef,
    useState,
    useEffect,
    forwardRef,
    useCallback,
    useImperativeHandle,
} from 'react';

import type { IAnimatedText } from './types';

const AnimatedText: FC<IAnimatedText> = forwardRef(
    (
        {
            text,
            animationDelay = 5,
            onAnimationEnd,
            isFinalTextChunk = false,
            replacementCallback,
        },
        ref
    ) => {
        const [animatedText, setAnimatedText] = useState<string>('');
        const currentIdx = useRef<number>(0);
        const summary = useRef<string>('');
        const interval = useRef<number>();
        const isFinal = useRef<boolean>(false);

        const stopAnimation = useCallback(() => {
            window.clearInterval(interval.current);
        }, []);

        // Making a callback, so that the function passed should not cause the re-renders
        const onAnimationEndCallback = useCallback(
            () => onAnimationEnd?.(),
            [onAnimationEnd]
        );

        const startAnimation = useCallback(() => {
            if (!interval.current) {
                interval.current = window.setInterval(() => {
                    if (currentIdx.current < summary.current.length) {
                        setAnimatedText((state) => {
                            const newState =
                                state + summary.current[currentIdx.current];

                            currentIdx.current += 1;

                            return newState;
                        });
                    }
                    if (
                        isFinal.current &&
                        currentIdx.current === summary.current.length
                    ) {
                        onAnimationEndCallback();
                        window.clearInterval(interval.current);
                        interval.current = undefined;
                    }
                }, animationDelay);
            }
        }, [animationDelay, isFinal, onAnimationEndCallback]);

        const resetAnimation = useCallback(() => {
            stopAnimation();
            setAnimatedText('');
            startAnimation();
        }, [startAnimation, stopAnimation]);

        useImperativeHandle(
            ref,
            () => ({
                stopAnimation,
                resetAnimation,
                startAnimation,
            }),
            [resetAnimation, startAnimation, stopAnimation]
        );

        useEffect(() => {
            startAnimation();
            return () => {
                window.clearInterval(interval.current);
                interval.current = undefined;
            };
        }, [startAnimation]);

        useEffect(() => {
            summary.current += text;
            if (replacementCallback) {
                summary.current = replacementCallback(summary.current);
            }
        }, [replacementCallback, text]);

        useEffect(() => {
            isFinal.current = isFinalTextChunk;
        }, [isFinalTextChunk]);

        return <span>{animatedText}</span>;
    }
);

export default AnimatedText;
