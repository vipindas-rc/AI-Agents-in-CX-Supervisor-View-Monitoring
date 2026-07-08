import type { FC } from 'react';

import type { IAppIcon } from './types/AppIcon';

export const AgentApp: FC<IAppIcon> = ({
    accentColor = 'currentColor',
    height = 42,
    width = 39,
    ...props
}) => (
    <svg
        viewBox={`0 0 ${width} ${height}`}
        {...props}
        style={{ height: '1em' }}
    >
        <title>{'Agent app'}</title>
        <g strokeWidth={2.3} fill='none' fillRule='evenodd'>
            <path
                d='M22.9 27.512s2.598-2.531 3.164-5.935c1.524 0 2.465-3.618.941-4.891.064-1.34 1.958-10.52-7.634-10.52-9.593 0-7.698 9.18-7.635 10.52-1.524 1.273-.583 4.891.941 4.891.566 3.404 3.165 5.935 3.165 5.935s-.02 2.393-.904 2.531c-2.85.446-13.487 5.063-13.487 10.125h35.84c0-5.062-10.638-9.679-13.487-10.125-.885-.138-.905-2.53-.905-2.53z'
                stroke={accentColor}
            />
            <g stroke='currentColor'>
                <path d='M6.915 13.469c0-6.687 5.504-12.108 12.295-12.108 6.79 0 12.295 5.42 12.295 12.108' />
                <path
                    d='M6.915 21.294H4.208c-1.07 0-1.938-.855-1.938-1.908v-4.01c0-1.054.868-1.906 1.938-1.906h2.707v7.824zM31.505 21.294h2.707c1.07 0 1.937-.855 1.937-1.908v-4.01c0-1.054-.868-1.906-1.937-1.906h-2.707v7.824z'
                    strokeLinejoin='round'
                />
            </g>
        </g>
    </svg>
);
