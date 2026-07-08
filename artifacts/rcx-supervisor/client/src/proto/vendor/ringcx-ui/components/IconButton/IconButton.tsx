import { forwardRef } from 'react';

import MuiIconButton from '@material-ui/core/IconButton';
import { withStyles } from '@material-ui/core/styles';

import { IconButtonTheme } from './IconButton.styled';
import type { IIconButtonProps } from './types/IconButton';

const IconButton = forwardRef<HTMLButtonElement, IIconButtonProps>(
    ({ children, ...restProps }, ref) => (
        <MuiIconButton ref={ref} {...restProps}>
            {children}
        </MuiIconButton>
    )
);

export default withStyles(IconButtonTheme)(IconButton);
