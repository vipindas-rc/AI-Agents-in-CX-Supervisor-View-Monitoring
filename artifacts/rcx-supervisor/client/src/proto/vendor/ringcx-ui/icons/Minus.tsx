import type { FC } from 'react';

import type { SvgIconProps } from '@material-ui/core/SvgIcon';

export const Minus: FC<SvgIconProps> = ({
    height = 8,
    width = 8,
    ...props
}) => (
    <svg width={width} height={height} viewBox='0 0 8 2' {...props}>
        <g stroke='none' strokeWidth='1' fillRule='evenodd'>
            <g transform='translate(-4.000000, -7.000000)'>
                <rect x='0' y='0' width='16' height='16' fill='none' />
                <polygon
                    className='symbol'
                    fill='currentColor'
                    points='4 8.5 12 8.5 12 7 4 7'
                />
            </g>
        </g>
    </svg>
);
