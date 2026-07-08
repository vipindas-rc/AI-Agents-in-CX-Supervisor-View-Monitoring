import type { ReactNode } from 'react';

import type { PopperProps } from '@material-ui/core/Popper';

export interface IBulkEditPopper
    extends Omit<PopperProps, 'children' | 'open'> {
    names: string[];
    hideOnBlur?: boolean;
    renderLabel?(count: number): ReactNode;
    className?: string;
    disabled?: boolean;
}
