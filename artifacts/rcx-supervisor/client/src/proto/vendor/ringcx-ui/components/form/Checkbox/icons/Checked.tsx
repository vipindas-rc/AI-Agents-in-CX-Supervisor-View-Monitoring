import type { FC } from 'react';

import { useTheme } from 'styled-components';

export const Checked: FC<{ disabled?: boolean }> = ({ disabled }) => {
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
                    fill={theme.colors.background}
                    fillRule='nonzero'
                    d='M6.178 10.312l-2.37-2.488L3 8.665 6.178 12 13 4.841 12.198 4z'
                />
            </g>
        </svg>
    );
};
