import type { MouseEvent, ReactNode } from 'react';

import type { PopoverProps } from '@material-ui/core/Popover';

export interface IPopover
    extends Omit<PopoverProps, 'open' | 'anchorEl' | 'onClose'> {
    toggleComponent: ReactNode;
    openOnHover?: boolean;
    onOpen?: (event: MouseEvent<HTMLDivElement>) => void;
    onClose?: {
        bivarianceHack(
            event: MouseEvent<HTMLDivElement>,
            reason?: 'backdropClick' | 'escapeKeyDown'
        ): void;
    }['bivarianceHack'];
}

export type HandleCloseReason = 'backdropClick' | 'escapeKeyDown';
export type AnchorElType = HTMLDivElement | null;
