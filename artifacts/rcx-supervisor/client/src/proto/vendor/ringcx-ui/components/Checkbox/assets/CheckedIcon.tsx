import { memo } from 'react';

import { withStyles } from '@material-ui/core/styles';
import type { SvgIconProps } from '@material-ui/core/SvgIcon';

import { IconTheme } from './Icon.styled';
import Checked from './svgs/Checkbox_Checked';

const CheckedIcon = ({ ...props }: SvgIconProps) => (
    <Checked {...{ ...props }} />
);

export default memo(withStyles(IconTheme)(CheckedIcon));
