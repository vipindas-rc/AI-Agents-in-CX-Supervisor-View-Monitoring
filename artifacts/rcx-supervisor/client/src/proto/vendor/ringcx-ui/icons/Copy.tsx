import type { FC } from 'react';

import { SVG } from './svg.styled';
import type { ISvgIcon } from './types/AppIcon';

export const Copy: FC<ISvgIcon> = (props) => (
    <SVG viewBox='0 0 16 16' {...{ height: '16px', width: '16px', ...props }}>
        <g fill='none' fillRule='evenodd'>
            <path d='M0 0h16v16H0z' />
            <path
                d='M13 4.25c.97 0 1.75.78 1.75 1.75v8c0 .97-.78 1.75-1.75 1.75H7c-.97 0-1.75-.78-1.75-1.75V6c0-.97.78-1.75 1.75-1.75h6zm0 1.5H7a.25.25 0 00-.25.25v8c0 .14.11.25.25.25h6c.14 0 .25-.11.25-.25V6a.25.25 0 00-.25-.25zM9 .25c.97 0 1.75.78 1.75 1.75v1h-1.5V2A.25.25 0 009 1.75H3a.25.25 0 00-.25.25v8c0 .14.11.25.25.25h1v1.5H3c-.97 0-1.75-.78-1.75-1.75V2c0-.97.78-1.75 1.75-1.75h6z'
                fill='currentColor'
            />
        </g>
    </SVG>
);
