import type { FC } from 'react';

import type { SvgIconProps } from '@material-ui/core/SvgIcon';

export const EyeOpened: FC<SvgIconProps> = ({
    height = 16,
    width = 16,
    ...props
}) => (
    <svg viewBox={`0 0 16 10`} height={height} width={width} {...props}>
        <g
            id='Symbols'
            stroke='none'
            strokeWidth='1'
            fill='none'
            fillRule='evenodd'
        >
            <g
                id='Icon-/-16-px-/-Eye-Open'
                transform='translate(0.000000, -3.000000)'
            >
                <g id='Group'>
                    <rect id='Rectangle' x='0' y='0' width='16' height='16' />
                    <path
                        d='M8,3 C4.59090909,3 1.67954545,5.07333333 0.5,8 C1.67954545,10.9266667 4.59090909,13 8,13 C11.4090909,13 14.3204545,10.9266667 15.5,8 C14.3204545,5.07333333 11.4090909,3 8,3 L8,3 Z M8,11.3333333 C6.11818182,11.3333333 4.59090909,9.84 4.59090909,8 C4.59090909,6.16 6.11818182,4.66666667 8,4.66666667 C9.88181818,4.66666667 11.4090909,6.16 11.4090909,8 C11.4090909,9.84 9.88181818,11.3333333 8,11.3333333 L8,11.3333333 Z M8,6 C6.86818182,6 5.95454545,6.89333333 5.95454545,8 C5.95454545,9.10666667 6.86818182,10 8,10 C9.13181818,10 10.0454545,9.10666667 10.0454545,8 C10.0454545,6.89333333 9.13181818,6 8,6 L8,6 Z'
                        id='eyeOpened'
                        fill='#A1A1A1'
                    />
                </g>
            </g>
        </g>
    </svg>
);
