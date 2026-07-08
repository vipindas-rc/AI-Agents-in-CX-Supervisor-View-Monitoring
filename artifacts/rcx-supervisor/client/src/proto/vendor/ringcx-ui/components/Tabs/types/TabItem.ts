import type { ReactNode } from 'react';

export default interface ITabItem {
    disabled?: boolean;
    label: string;
    content?: ReactNode;
    value?: string | number;
}
