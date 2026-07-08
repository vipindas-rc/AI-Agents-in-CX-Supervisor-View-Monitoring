import type { ReactNode } from 'react';

import type { TooltipProps } from '@material-ui/core/Tooltip';

import type { TextInputSizes } from '../../Inputs/TextInput/types/TextInput';

export interface IAdornment {
    tooltipMessage?: ReactNode;
    tooltipPopperProps?: TooltipProps['PopperProps'];
    tooltipWidth?: string; // it works with DisablePortal == true
    icon?: ReactNode;
    size?: TextInputSizes;
    placement?: TooltipProps['placement'];
    legacyMode?: boolean;
    offset?: string;
    inline?: boolean;
}
