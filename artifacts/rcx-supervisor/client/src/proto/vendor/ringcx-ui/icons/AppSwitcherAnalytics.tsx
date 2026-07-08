import type { FC } from 'react';

import type { IAppIcon } from './types/AppIcon';

export const AppSwitcherAnalytics: FC<IAppIcon> = () => {
    const defId = 'eui-AppSwitcherAnalytics-' + Date.now() + Math.random();

    return (
        <svg width='48' height='48' xmlns='http://www.w3.org/2000/svg'>
            <defs>
                <linearGradient
                    x1='3.389%'
                    y1='0%'
                    x2='96.611%'
                    y2='100%'
                    id={defId}
                >
                    <stop stopColor='#066FAC' offset='0%' />
                    <stop stopColor='#509AC4' offset='100%' />
                </linearGradient>
                <path id='a' d='M0 0h90v90H0z' />
            </defs>
            <g fill='none' fillRule='evenodd'>
                <path
                    d='M15 24c.5523 0 1 .4477 1 1v13c0 .5523-.4477 1-1 1h-4c-.5523 0-1-.4477-1-1V25c0-.5523.4477-1 1-1h4zm11 4c.5523 0 1 .4477 1 1v9c0 .5523-.4477 1-1 1h-4c-.5523 0-1-.4477-1-1v-9c0-.5523.4477-1 1-1h4zm11-6c.5523 0 1 .4477 1 1v15c0 .5523-.4477 1-1 1h-4c-.5523 0-1-.4477-1-1V23c0-.5523.4477-1 1-1h4zm-2-12c1.6569 0 3 1.3431 3 3s-1.3431 3-3 3a2.9882 2.9882 0 01-1.9524-.7222l-6.0567 3.4864c.006.0778.0091.1564.0091.2358 0 1.6569-1.3431 3-3 3-1.5796 0-2.874-1.2207-2.9913-2.7702l-5.7438-2.2625C14.715 17.6 13.9042 18 13 18c-1.6569 0-3-1.3431-3-3s1.3431-3 3-3 3 1.3431 3 3l-.004.105 5.5405 2.1824C22.0785 16.5092 22.9798 16 24 16c.8536 0 1.6239.3565 2.1702.9287l5.8791-3.384A3.0173 3.0173 0 0132 13c0-1.6569 1.3431-3 3-3z'
                    fill={`url(#${defId})`}
                />
            </g>
        </svg>
    );
};
