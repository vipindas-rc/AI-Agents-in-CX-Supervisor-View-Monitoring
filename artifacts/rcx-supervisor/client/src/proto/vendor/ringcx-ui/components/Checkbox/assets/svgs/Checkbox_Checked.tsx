import type { SvgIconProps } from '@material-ui/core/SvgIcon';

import { checkboxSize, checkboxScale } from './helpers';
import { theme } from '../../../../theme';

// generated with https://www.smooth-code.com/open-source/svgr/playground/
const SvgComponent = ({ fontSize, ...props }: SvgIconProps) => {
    const size = checkboxSize(fontSize);
    const scale = checkboxScale(fontSize);

    return (
        <svg width={size} height={size} aria-hidden='true' {...props}>
            <g fill='none' fillRule='evenodd'>
                <rect fill='currentColor' width={size} height={size} rx={3} />
                <path
                    transform={`scale(${scale})`}
                    fill={theme.colors.background}
                    fillRule='nonzero'
                    d='M6.178 10.312l-2.37-2.488L3 8.665 6.178 12 13 4.841 12.198 4z'
                />
            </g>
        </svg>
    );
};

export default SvgComponent;
