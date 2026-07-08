import type { IFormTextArea } from '@ringcx/ui';

export type IEuiFormTextAreaComponent = Omit<IFormTextArea, 'title'> & {
    label?: string;
    animationText?: string;
    loading?: boolean;
    loadingText?: string;
    onAnimationEnd?: () => void;
    animationDelay?: number;
    isFinal?: boolean;
    replacementCallback?: (str: string) => string;
};
