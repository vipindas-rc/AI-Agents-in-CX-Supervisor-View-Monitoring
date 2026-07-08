import type { FC } from 'react';

import { StyledArrow } from './ArrowIcon.styled';
import type IArrowIcon from './types';
import { ArrowDirection } from '../../../../icons/types/Arrow';
import { TOGGLE_ICON_SIZE } from '../../constants';

const ArrowIcon: FC<IArrowIcon> = ({
    direction = ArrowDirection.DOWN,
    disabled = false,
    className,
}) => (
    <StyledArrow
        disabled={disabled}
        direction={direction}
        width={TOGGLE_ICON_SIZE}
        height={TOGGLE_ICON_SIZE}
        className={className}
    />
);

export default ArrowIcon;
