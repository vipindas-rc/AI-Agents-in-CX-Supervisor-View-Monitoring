export type IAnimatedText = {
    text: string;
    animationDelay?: number;
    isFinalTextChunk?: boolean;
    onAnimationEnd?: () => void;
    replacementCallback?: (str: string) => string;
};
