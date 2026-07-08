import type { FC } from 'react';

import { useTheme } from 'styled-components';

export const Indeterminate: FC<{ disabled?: boolean }> = ({ disabled }) => {
    const theme = useTheme();
    const size = 16;
    const scale = 1;

    return (
        <svg
            width={size}
            height={size}
            color={disabled ? theme.colors.gray[300] : theme.colors.primary}
            aria-hidden='true'
        >
            <g fill='none' fillRule='evenodd'>
                <rect fill='currentColor' width={size} height={size} rx={3} />
                <path
                    transform={`scale(${scale})`}
                    d='M4.5 7.7h7.015'
                    stroke={theme.colors.background}
                    strokeLinecap='square'
                />
            </g>
        </svg>
    );
};
