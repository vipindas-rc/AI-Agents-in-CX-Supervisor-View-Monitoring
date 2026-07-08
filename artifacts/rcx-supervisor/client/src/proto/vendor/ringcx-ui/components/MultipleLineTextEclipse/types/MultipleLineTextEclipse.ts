import type { ReactElement } from 'react';

import type { PopperProps } from '@material-ui/core/Popper';

import type { IToolTipProps } from '../../Tooltip/types/Tooltip';
export interface IMultipleLineTextEclipse {
    tooltipMsg: string | ReactElement;
    className?: string;
    popperProps?: Partial<PopperProps>;
    placement?: IToolTipProps['placement'];
    lines?: number;
}
