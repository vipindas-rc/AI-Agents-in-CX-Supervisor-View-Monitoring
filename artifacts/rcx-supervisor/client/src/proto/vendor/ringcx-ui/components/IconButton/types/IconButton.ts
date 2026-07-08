import type { IconButtonProps } from '@material-ui/core/IconButton';
import type { WithStyles } from '@material-ui/core/styles';

import type { IconButtonTheme } from '../IconButton.styled';

export type IIconButtonProps = IconButtonProps &
    WithStyles<typeof IconButtonTheme>;
