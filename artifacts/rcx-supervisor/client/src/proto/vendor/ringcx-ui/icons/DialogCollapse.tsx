import type { FC } from 'react';

import type { IAppIcon } from './types/AppIcon';

export const DialogCollapse: FC<IAppIcon> = ({
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
            <path d='M10.312 6.43h3.86c.41 0 .75-.34.75-.75s-.34-.75-.75-.75h-2.03l3.65-3.65c.29-.29.29-.77 0-1.06a.742.742 0 0 0-.53-.22c-.19 0-.38.07-.53.22l-3.67 3.67V1.85c0-.41-.34-.75-.75-.75s-.75.34-.75.75v3.83c0 .41.34.75.75.75ZM1.268 15.792l3.67-3.67v2.04c0 .41.34.75.75.75s.76-.34.76-.76v-3.83c0-.41-.34-.75-.75-.75h-3.86c-.41 0-.75.34-.75.75s.34.75.75.75h2.03l-3.65 3.65c-.29.29-.29.77 0 1.06.29.29.77.29 1.06 0l-.01.01Z' />
        </g>
    </svg>
);
