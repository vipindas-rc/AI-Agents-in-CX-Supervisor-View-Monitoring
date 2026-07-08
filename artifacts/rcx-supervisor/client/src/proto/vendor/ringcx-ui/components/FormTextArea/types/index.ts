import type { ReactNode } from 'react';

import type ITextInput from '../../Inputs/TextInput/types/TextInput';

export type IFormTextArea = ITextInput & {
    cols?: number;
    rows?: number;
    readonly?: boolean;
    showOverlay?: boolean;
    overlayContent?: ReactNode;
};
