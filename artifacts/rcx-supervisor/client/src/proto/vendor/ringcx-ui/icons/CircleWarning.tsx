import type { FC } from 'react';

import { SVG } from './svg.styled';
import type { ISvgIcon } from './types/AppIcon';

export const CircleWarning: FC<ISvgIcon> = (props) => (
    <SVG viewBox='0 0 14 14' {...{ height: '16px', width: '16px', ...props }}>
        <g fill='none' fillRule='evenodd'>
            <path d='M-1-1h16v16H-1z' />
            <path
                d='M7 0a7 7 0 110 14A7 7 0 017 0zm0 1.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM7 10a1 1 0 110 2 1 1 0 010-2zm.22-7.25a.75.75 0 01.75.78l-.2 4.75a.75.75 0 01-.74.72h-.06a.75.75 0 01-.75-.72l-.19-4.75a.75.75 0 01.72-.78h.47z'
                fill='currentColor'
            />
        </g>
    </SVG>
);
