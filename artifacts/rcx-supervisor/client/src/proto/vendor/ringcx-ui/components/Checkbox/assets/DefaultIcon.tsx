import type { FC } from 'react';
import { memo } from 'react';

import { withStyles } from '@material-ui/core/styles';
import type { SvgIconProps } from '@material-ui/core/SvgIcon';

import { IconTheme } from './Icon.styled';
import Empty from './svgs/Checkbox_Empty';

const DefaultIcon: FC<SvgIconProps> = ({ ...props }) => (
    <Empty {...{ ...props }} />
);

export default memo(withStyles(IconTheme)(DefaultIcon));
