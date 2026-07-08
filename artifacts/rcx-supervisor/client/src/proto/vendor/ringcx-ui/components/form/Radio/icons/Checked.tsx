import type { FC } from 'react';

import { useTheme } from 'styled-components';

export const Checked: FC<{ disabled?: boolean }> = ({ disabled }) => {
    const theme = useTheme();
    const size = 16;

    return (
        <svg
            width={size}
            height={size}
            color={disabled ? theme.colors.gray[300] : theme.colors.primary}
        >
            <g fill='currentColor' fillRule='evenodd'>
                <g fill='none' fillRule='evenodd'>
                    <circle cx='8' cy='8' r='7.5' stroke='currentColor' />
                    <circle cx='8' cy='8' r='4.8' fill='currentColor' />
                </g>
            </g>
        </svg>
    );
};
