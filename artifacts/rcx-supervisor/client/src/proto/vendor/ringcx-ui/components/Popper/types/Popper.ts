import type { ReactNode } from 'react';

import type { PopperProps } from '@material-ui/core/Popper';

export interface IPopper extends Omit<PopperProps, 'open'> {
    toggleComponent: ReactNode;
    isOpen?: boolean;
    className?: string;
    onClose?: () => void;
    onOpen?: () => void;
    showOnHover?: boolean;
    hideOnBlur?: boolean;
    disabled?: boolean;
    enableKeyboardNavigation?: boolean;
}
