import type { ReactNode } from 'react';

export interface ISplash {
    text?: string;
    subText?: ReactNode;
    bgImage?: any;
    icon?: any;
    button?: any;
    splashType:
        | 'sidePanel'
        | 'plainTextPanel'
        | 'justSubtext'
        | 'graphicPanel'
        | 'startWorking';
    iconName?: string;
}
