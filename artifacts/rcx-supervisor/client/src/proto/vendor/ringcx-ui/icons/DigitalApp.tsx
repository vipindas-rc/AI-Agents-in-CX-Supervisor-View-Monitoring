import type { FC } from 'react';

import type { IAppIcon } from './types/AppIcon';

export const DigitalApp: FC<IAppIcon> = ({
    accentColor = 'currentColor',
    height = 48,
    width = 46,
    ...props
}) => (
    <svg
        viewBox={`0 0 ${width} ${height}`}
        {...props}
        style={{ height: '1em' }}
    >
        <title>{'Digital app'}</title>
        <g strokeWidth={2.3} fill='none' fillRule='evenodd'>
            <path
                d='M9.294 8.808h23.17M9.294 15.44h11.584'
                stroke={accentColor}
            />
            <path
                d='M19.473 32l22.678-.12c1.325 0 2.4-1.093 2.4-2.441V3.566c0-1.485-1.182-2.691-2.643-2.691H4.464c-1.45 0-2.625 1.196-2.625 2.677v25.663c0 1.471 1.173 2.665 2.618 2.665h6.393l.082 6.992c.01.783.916 1.194 1.495.677L19.473 32z'
                stroke='currentColor'
            />
        </g>
    </svg>
);
