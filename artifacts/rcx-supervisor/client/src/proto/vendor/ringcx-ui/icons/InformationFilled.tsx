import type { FC } from 'react';

import { SVG } from './svg.styled';
import type { ISvgIcon } from './types/AppIcon';

export const InformationFilled: FC<ISvgIcon> = (props) => (
    <SVG
        {...{ height: '12px', width: '12px', ...props }}
        data-aid='information-filled-icon'
    >
        <path
            d='M6 1C3.2385 1 1 3.2385 1 6C1 8.7615 3.2385 11 6 11C8.7615 11 11 8.7615 11 6C11 3.2385 8.7615 1 6 1ZM5.625 3.75C5.625 3.543 5.793 3.375 6 3.375C6.207 3.375 6.375 3.543 6.375 3.75V6.03552C6.375 6.24252 6.207 6.41052 6 6.41052C5.793 6.41052 5.625 6.24252 5.625 6.03552V3.75ZM6.01001 8.25C5.73401 8.25 5.50745 8.026 5.50745 7.75C5.50745 7.474 5.729 7.25 6.005 7.25H6.01001C6.28651 7.25 6.51001 7.474 6.51001 7.75C6.51001 8.026 6.28601 8.25 6.01001 8.25Z'
            fill='currentColor'
        />
    </SVG>
);
