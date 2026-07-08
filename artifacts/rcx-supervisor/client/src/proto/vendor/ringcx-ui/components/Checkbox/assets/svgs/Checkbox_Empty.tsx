import type { SvgIconProps } from '@material-ui/core/SvgIcon';

import { checkboxSize } from './helpers';
import { theme } from '../../../../theme';

// generated with https://www.smooth-code.com/open-source/svgr/playground/
const SvgComponent = ({ fontSize, ...props }: SvgIconProps) => {
    const size = checkboxSize(fontSize);

    return (
        <svg width={size} height={size} aria-hidden='true' {...props}>
            <rect
                x={0.5}
                y={0.5}
                width={size - 1}
                height={size - 1}
                rx={3}
                stroke={theme.colors.gray[600]}
                fill='none'
                fillRule='evenodd'
            />
        </svg>
    );
};

export default SvgComponent;
