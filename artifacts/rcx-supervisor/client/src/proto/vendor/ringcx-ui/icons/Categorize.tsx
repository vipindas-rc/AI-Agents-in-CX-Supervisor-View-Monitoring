import type { FC } from 'react';

import { SVG } from './svg.styled';
import type { ISvgIcon } from './types/AppIcon';

export const Categorize: FC<ISvgIcon> = (props) => (
    <SVG viewBox={`0 0 16 16`} {...{ height: '16px', width: '16px', ...props }}>
        <path
            d='M13.998 0C15.104 0 16 .897 16 2.004v5.014c0 .532-.212 1.043-.59 1.42l-7.005 6.978a2.001 2.001 0 01-2.827-.001L.588 10.43a2.004 2.004 0 01-.105-2.723l.103-.11L7.582.588A2.002 2.002 0 018.998 0h5zm0 2.004h-5l-6.996 7.01 4.99 4.982 7.006-6.978V2.004zM9.689 4.707a1 1 0 111.414 1.414A1 1 0 019.69 4.707z'
            fill='currentcolor'
        />
    </SVG>
);
