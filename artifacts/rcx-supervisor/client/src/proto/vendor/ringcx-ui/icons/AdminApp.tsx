import type { FC } from 'react';

import type { IAppIcon } from './types/AppIcon';

export const AdminApp: FC<IAppIcon> = ({
    accentColor = 'currentColor',
    height = 42,
    width = 41,
    ...props
}) => (
    <svg
        viewBox={`0 0 ${width} ${height}`}
        {...props}
        style={{ height: '1em' }}
    >
        <title>{'Admin app'}</title>
        <g strokeWidth={2.3} fill='none' fillRule='evenodd'>
            <path
                d='M35.057 39.54c0 .65-.543 1.178-1.17 1.138h-3.926c-.626.04-1.17-.488-1.17-1.138V24.672c-2.672-1.137-4.551-3.778-4.551-6.784 0-3.25 2.171-6.012 5.137-7.028v7.069h5.095V10.86c2.965 1.016 5.137 3.778 5.137 7.028 0 3.006-1.88 5.647-4.552 6.784V39.54h0z'
                stroke={accentColor}
            />
            <g stroke='currentColor'>
                <path d='M22.164 7.779c0 3.454-2.88 6.254-6.429 6.254-3.55 0-6.428-2.8-6.428-6.254 0-3.455 2.878-6.253 6.428-6.253s6.429 2.798 6.429 6.253z' />
                <path
                    d='M23.287 27.834H1.541c0-4.955 4.13-8.972 9.225-8.972h9.939'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                />
            </g>
        </g>
    </svg>
);
