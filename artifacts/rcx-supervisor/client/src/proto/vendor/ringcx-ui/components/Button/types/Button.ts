import type { ButtonProps } from '@material-ui/core/Button';
import type { WithStyles } from '@material-ui/core/styles';

import type { ButtonTheme } from '../Button.styled';

export type IStyledButtonProps = Omit<
    ButtonProps & WithStyles<typeof ButtonTheme>,
    'classes'
> & {
    loading?: boolean;
    'data-aid'?: string;
};
