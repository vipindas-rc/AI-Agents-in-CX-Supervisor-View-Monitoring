import type { FC } from 'react';

import type { SvgIconProps } from '@material-ui/core/SvgIcon';

export const Plus: FC<SvgIconProps> = ({ height = 8, width = 8, ...props }) => (
    <svg width={width} height={height} viewBox='0 0 8 8' {...props}>
        <g stroke='none' strokeWidth='1' fillRule='evenodd'>
            <g transform='translate(-4.000000, -4.000000)'>
                <rect x='0' y='0' width='16' height='16' fill='none' />
                <path
                    className='symbol'
                    d='M8.75,4 L8.75,7.25 L12,7.25 L12,8.75 L8.75,8.75 L8.75,12 L7.25,12 L7.25,8.75 L4,8.75 L4,7.25 L7.25,7.25 L7.25,4 L8.75,4 Z'
                    fill='currentColor'
                />
            </g>
        </g>
    </svg>
);
