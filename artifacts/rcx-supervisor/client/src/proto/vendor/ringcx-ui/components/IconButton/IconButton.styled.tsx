import { alpha, createStyles } from '@material-ui/core/styles';

import { theme } from '../../theme';

const baseColors = {
    color: theme.colors.gray[700],
    '&:hover': {
        backgroundColor: `var(--menu-item-hover, ${alpha(
            theme.colors.gray[700],
            0.17
        )})`,
        color: theme.colors.gray[900],
    },
};

export const IconButtonTheme = createStyles({
    root: {
        padding: '8px',
        fontSize: '16px',
        ...baseColors,
    },
});
