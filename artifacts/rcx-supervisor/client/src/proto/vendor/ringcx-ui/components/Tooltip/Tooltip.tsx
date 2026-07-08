import deepmerge from 'deepmerge';

import { StyledTooltip } from './Tooltip.styled';
import type { IToolTipProps } from './types/Tooltip';

const defaultPopperProps = {
    modifiers: {
        offset: {
            offset: '0, -4px',
        },
        flip: {
            enabled: false,
        },
        preventOverflow: {
            padding: 8,
            enabled: true,
            boundariesElement: 'window',
        },
    },
};

const Tooltip = ({ children, PopperProps, ...restProps }: IToolTipProps) => {
    /*
     * TODO: Replace deepmerge with something more reliable. Now it would fail if we pass any object with circular depencency
     * Example: JSX element, DOM element, etc.
     */

    const mergedPopperProps = deepmerge(defaultPopperProps, PopperProps || {});

    return (
        <StyledTooltip arrow PopperProps={mergedPopperProps} {...restProps}>
            {children}
        </StyledTooltip>
    );
};

export default Tooltip;
