import type { FC } from 'react';

import { SVG } from './svg.styled';
import type { ISvgIcon } from './types/AppIcon';

export const Lock: FC<ISvgIcon> = (props) => (
    <SVG viewBox='0 0 12 16' {...{ height: '16px', width: '16px', ...props }}>
        <g fill='none' fillRule='evenodd'>
            <path d='M-2 0h16v16H-2z' />
            <path
                d='M5.96.1c2 0 3.63 1.65 3.63 3.68l-.02 2.47h.68c.8 0 1.46.66 1.46 1.48v6.69c0 .81-.65 1.48-1.46 1.48H1.66c-.8 0-1.46-.67-1.46-1.48V7.73c0-.82.65-1.48 1.46-1.48h.67V3.78A3.66 3.66 0 015.96.1zm4.25 7.67H1.7v6.6h8.5v-6.6zM6 9a1.25 1.25 0 01.75 2.25v.8a.7.7 0 01-1.4 0v-.73A1.25 1.25 0 016 9zm-.04-7.38c-1.17 0-2.12.97-2.12 2.16v2.47h4.22l.02-2.47c0-1.19-.96-2.16-2.12-2.16z'
                fill='currentColor'
            />
        </g>
    </SVG>
);
