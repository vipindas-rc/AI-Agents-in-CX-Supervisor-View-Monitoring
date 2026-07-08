import type { FC } from 'react';

import type { SvgIconProps } from '@material-ui/core/SvgIcon';

export const CloseSvg: FC<SvgIconProps> = ({
    height = 8,
    width = 8,
    ...props
}) => (
    <svg width={width} height={height} viewBox='0 0 8 8' {...props}>
        <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
            <g transform='translate(-948.000000, -689.000000)'>
                <g transform='translate(944.000000, 685.000000)'>
                    <rect x='0' y='0' width='16' height='16' />
                    <polygon
                        fill='currentColor'
                        points='12 10.872 10.872 12 8 9.128 5.128 12 4 10.872 6.872 8 4 5.128 5.128 4 8 6.872 10.872 4 12 5.128 9.128 8'
                    />
                </g>
            </g>
        </g>
    </svg>
);
