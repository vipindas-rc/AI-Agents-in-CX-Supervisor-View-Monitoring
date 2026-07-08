import type { ReactElement } from 'react';

export type IClipboard = {
    children: (copy: (text: string) => Promise<boolean>) => ReactElement;
};
