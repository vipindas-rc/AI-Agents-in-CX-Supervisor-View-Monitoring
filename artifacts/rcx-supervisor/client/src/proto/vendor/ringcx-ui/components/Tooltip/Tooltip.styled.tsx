import { Tooltip } from '@material-ui/core';
import withStyles from '@material-ui/core/styles/withStyles';

import { theme } from '../../theme';

export const StyledTooltip = withStyles({
    tooltip: {
        fontSize: '14px',
        letterSpacing: 0.15,
        lineHeight: '16px',
        backgroundColor: `var(--tooltip-background, ${theme.colors.gray[800]})`,
        color: `var(--tooltip-text, ${theme.colors.gray[200]})`,
        borderRadius: '2px',
        minWidth: '46px',
        boxSizing: 'border-box',
        padding: '8px 10px',
    },
    arrow: {
        color: `var(--tooltip-background, ${theme.colors.gray[800]})`,
    },
})(Tooltip);
