import type { FC } from 'react';

import { SVG } from './svg.styled';
import type { ISvgIcon } from './types/AppIcon';

export const Warning: FC<ISvgIcon> = (props) => (
    <SVG viewBox='0 0 16 16' {...{ height: '16px', width: '16px', ...props }}>
        <g fill='none' fillRule='evenodd'>
            <path d='M0 0h16v16H0z' />
            <path
                fill='currentColor'
                d='M8.447.107a1 1 0 01.447.447l7 13.999A1 1 0 0114.998 16H1.001a1 1 0 01-.895-1.447l7-13.999A1 1 0 018.446.107zm-.835 3.024l-.047.077L2.29 13.756a.5.5 0 00.357.715l.09.008h10.548a.5.5 0 00.48-.64l-.033-.083L8.459 3.208a.5.5 0 00-.847-.077zM8 11.438a1.014 1.014 0 110 2.028 1.014 1.014 0 010-2.028zm.257-5.576a.75.75 0 01.749.789l-.184 3.569a.75.75 0 01-.75.711h-.145a.75.75 0 01-.749-.711l-.184-3.57a.75.75 0 01.71-.787h.553z'
            />
        </g>
    </SVG>
);
