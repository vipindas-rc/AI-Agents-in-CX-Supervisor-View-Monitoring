import type { FC } from 'react';

import { SVG } from './svg.styled';
import type { ISvgIcon } from './types/AppIcon';

export const Close: FC<ISvgIcon> = (props) => (
    <SVG viewBox='0 0 14 14' {...props}>
        <defs>
            <polygon
                id='path-cross'
                points='14 1.4 12.6 0 7 5.6 1.4 0 0 1.4 5.6 7 0 12.6 1.4 14 7 8.4 12.6 14 14 12.6 8.4 7'
            />
        </defs>
        <g stroke='none' strokeWidth='1' fill='none' fillRule='evenodd'>
            <g transform='translate(-710.000000, -565.000000)'>
                <g transform='translate(710.000000, 565.000000)'>
                    <mask fill='white'>
                        <use xlinkHref='#path-cross' />
                    </mask>
                    <use fill='currentColor' xlinkHref='#path-cross' />
                </g>
            </g>
        </g>
    </SVG>
);
