import type { Ref } from 'react';

import type { SvgIconProps } from '@material-ui/core/SvgIcon';

export interface ISvgIcon extends Omit<SvgIconProps, 'ref'> {
    ref?: Ref<SVGSVGElement>;
}

export interface IAppIcon extends SvgIconProps {
    accentColor?: string;
}
