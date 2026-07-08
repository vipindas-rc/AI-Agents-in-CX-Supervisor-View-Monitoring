import type { FC } from 'react';

import { SVG } from './svg.styled';
import type { ISvgIcon } from './types/AppIcon';

export const PrebuiltReport: FC<ISvgIcon> = (props) => (
    <SVG viewBox={`0 0 18 24`} {...{ ...props }}>
        <g fill='none' fillRule='evenodd'>
            <path
                fill='currentColor'
                d='M13 0a1 1 0 0 1 1 1v1h2a2 2 0 0 1 2 2v18a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h2V1a1 1 0 0 1 1-1h8ZM4 3.5H2a.5.5 0 0 0-.492.41L1.5 4v18a.5.5 0 0 0 .41.492L2 22.5h14a.5.5 0 0 0 .492-.41L16.5 22V4a.5.5 0 0 0-.41-.492L16 3.5h-2V5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V3.5Zm9.268 7.422a.75.75 0 0 1 .171.964l-.064.091-4.533 5.107a.75.75 0 0 1-1.049.112l-.081-.076-2.494-2.61a.75.75 0 0 1 1.018-1.096l.08.076 1.908 1.977 3.989-4.438a.75.75 0 0 1 1.055-.107ZM12.5 1.5h-7v3h7v-3Z'
            />
        </g>
    </SVG>
);
