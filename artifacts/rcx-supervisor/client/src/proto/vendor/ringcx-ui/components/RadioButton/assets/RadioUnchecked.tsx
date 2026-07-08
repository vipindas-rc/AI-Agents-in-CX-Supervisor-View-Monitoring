import type { FC } from 'react';

import { SVG } from '../../../icons/svg.styled';
import type { ISvgIcon } from '../../../icons/types/AppIcon';

export const RadioUnchecked: FC<ISvgIcon> = (props) => (
    <SVG {...props}>
        <circle
            cx='8'
            cy='8'
            r='7.5'
            fill='none'
            fillRule='evenodd'
            stroke='currentColor'
        />
    </SVG>
);
