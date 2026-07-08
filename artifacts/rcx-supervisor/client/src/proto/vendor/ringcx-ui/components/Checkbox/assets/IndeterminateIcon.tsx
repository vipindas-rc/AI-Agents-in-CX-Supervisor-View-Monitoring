import type { FC } from 'react';
import { memo } from 'react';

import { withStyles } from '@material-ui/core/styles';
import type { SvgIconProps } from '@material-ui/core/SvgIcon';

import { IconTheme } from './Icon.styled';
import Indeterminate from './svgs/Checkbox_Multiple';

const IndeterminateIconFC: FC<SvgIconProps> = ({ ...props }) => (
    <Indeterminate {...{ ...props }} />
);

export default memo(withStyles(IconTheme)(IndeterminateIconFC));
