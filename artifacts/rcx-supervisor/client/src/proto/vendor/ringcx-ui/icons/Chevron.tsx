import type { FC } from 'react';

import type { SvgIconProps } from '@material-ui/core/SvgIcon';

export const Chevron: FC<SvgIconProps> = ({
    height = 12,
    width = 7,
    ...props
}) => (
    <svg width={width} height={height} viewBox='0 0 7 12' {...props}>
        <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
            <g transform='translate(-455.000000, -1073.000000)'>
                <g transform='translate(459.000000, 1079.000000) scale(-1, 1) translate(-459.000000, -1079.000000) translate(451.000000, 1071.000000)'>
                    <rect x='0' y='0' width='16' height='16' />
                    <polygon
                        fill='currentColor'
                        points='5 3.10713008 9.81911673 8 5 12.8928699 6.09044164 14 12 8 6.09044164 2'
                    />
                </g>
            </g>
        </g>
    </svg>
);
