import type { FC } from 'react';

import type { IAppIcon } from './types/AppIcon';

export const DialogExpand: FC<IAppIcon> = ({
    height = 16,
    width = 16,
    className,
}) => (
    <svg
        width={`${width}px`}
        height={`${height}px`}
        viewBox={`0 0 ${width} ${height}`}
        className={className}
    >
        <g fill='currentColor' fillRule='nonzero'>
            <path d='M15.26 0H11.4c-.41 0-.75.34-.75.75s.34.75.75.75h2.03L9.78 5.15c-.29.29-.29.77 0 1.06.15.15.34.22.53.22s.38-.07.53-.22l3.67-3.67v2.04c0 .41.34.75.75.75s.75-.34.75-.75V.75c0-.41-.34-.75-.75-.75ZM5.18 9.78l-3.67 3.67v-2.04c0-.41-.34-.75-.75-.75S0 11 0 11.42v3.83c0 .41.34.75.75.75h3.86c.41 0 .75-.34.75-.75s-.34-.75-.75-.75H2.58l3.65-3.65c.29-.29.29-.77 0-1.06a.754.754 0 0 0-1.06 0l.01-.01Z' />
        </g>
    </svg>
);
