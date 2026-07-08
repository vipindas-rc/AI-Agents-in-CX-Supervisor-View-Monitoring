import type { FC } from 'react';

import { SVG } from '../../../icons/svg.styled';
import type { ISvgIcon } from '../../../icons/types/AppIcon';

export const RadioChecked: FC<ISvgIcon> = (props) => (
    <SVG {...props}>
        <g fill='currentColor' fillRule='evenodd'>
            <g fill='none' fillRule='evenodd'>
                <circle cx='8' cy='8' r='7.5' stroke='currentColor' />
                <circle cx='8' cy='8' r='4.8' fill='currentColor' />
            </g>
        </g>
    </SVG>
);
