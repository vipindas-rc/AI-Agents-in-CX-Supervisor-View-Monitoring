import type { FC } from 'react';

import { StyledBadge } from './Badge.styled';
import type { IBadgeProps } from './types/Badge';

const Badge: FC<IBadgeProps> = ({
    children,
    color = 'primary',
    max = 99,
    verticalCenter = false,
    ...restProps
}) => {
    return (
        <StyledBadge {...{ color, max, verticalCenter }} {...restProps}>
            {children}
        </StyledBadge>
    );
};

export default Badge;
