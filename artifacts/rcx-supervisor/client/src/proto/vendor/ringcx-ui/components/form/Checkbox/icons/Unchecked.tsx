import type { FC } from 'react';

import { useTheme } from 'styled-components';

export const Unchecked: FC<{ disabled?: boolean }> = ({ disabled }) => {
    const theme = useTheme();
    const size = 16;

    return (
        <svg
            width={size}
            height={size}
            color={disabled ? theme.colors.gray[300] : theme.colors.gray[700]}
            aria-hidden='true'
        >
            <rect
                x={0.5}
                y={0.5}
                width={size - 1}
                height={size - 1}
                rx={3}
                stroke='currentColor'
                fill='none'
                fillRule='evenodd'
            />
        </svg>
    );
};
