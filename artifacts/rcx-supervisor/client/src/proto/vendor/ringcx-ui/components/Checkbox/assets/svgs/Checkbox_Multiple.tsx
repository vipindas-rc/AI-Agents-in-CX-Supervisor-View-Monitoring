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
                    d='M4.5 7.7h7.015'
                    stroke={theme.colors.background}
                    strokeLinecap='square'
                />
            </g>
        </svg>
    );
};

export default SvgComponent;
