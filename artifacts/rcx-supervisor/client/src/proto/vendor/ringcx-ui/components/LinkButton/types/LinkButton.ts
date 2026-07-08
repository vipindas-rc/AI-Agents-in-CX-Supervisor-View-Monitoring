import type { ReactNode, MouseEvent, KeyboardEvent } from 'react';

import type { LinkProps } from '@material-ui/core';

export type LinkIconPositionEnum = 'right' | 'left';

export type LinkButtonType = {
    title?: ReactNode;
    icon?: ReactNode;
    disabled?: boolean;
    iconPosition?: LinkIconPositionEnum;
    component?: string;
    onClick?: (event: MouseEvent | KeyboardEvent) => void;
} & Omit<LinkProps, 'onClick'>;
