import type { MouseEventHandler } from 'react';

import type { ISideNav } from '../../../../types';

export interface IStyleMenuItem {
    selected: boolean;
    href?: string;
    onClick?: MouseEventHandler<HTMLDivElement>;
    layout?: ISideNav['layout'];
}
