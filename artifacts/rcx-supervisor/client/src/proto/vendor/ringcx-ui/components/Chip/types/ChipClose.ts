import type { SvgIconProps } from '@material-ui/core/SvgIcon';

import type { ChipSize } from './ChipProps';

export interface IChipClose extends SvgIconProps {
    disabled: boolean;
    size: ChipSize;
}
