import type { TooltipProps } from '@material-ui/core/Tooltip';

export type WrapperMeasures = number | 'auto';

// extend ui-material TooltipProps, override classes with our custom def
export type IToolTipProps = Omit<TooltipProps, 'classes'>;
