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
        >
            <circle
                cx='8'
                cy='8'
                r='7.5'
                fill='none'
                fillRule='evenodd'
                stroke='currentColor'
            />
        </svg>
    );
};
