import type { FC } from 'react';
import { useMemo } from 'react';

import { StyledSpinnerWrapper, StyledSwitch } from './Switch.styled';
import type { ISwitchProps } from './types';
import Spinner from '../Spinner';

const Switch: FC<ISwitchProps> = ({
    inProgress = false,
    disabled = false,
    size = 'medium',
    ...restProps
}) => {
    const width = size === 'medium' ? 43 : 26;
    const height = size === 'medium' ? 26 : 16;

    const spinner = useMemo(
        () => (
            <StyledSpinnerWrapper width={height - 2} height={height - 2}>
                <Spinner size='small' />
            </StyledSpinnerWrapper>
        ),
        [height]
    );

    return (
        <StyledSwitch
            {...{
                disabled: disabled || inProgress,
                width,
                height,
                disableRipple: true,
                ...(inProgress && {
                    icon: spinner,
                    checkedIcon: spinner,
                    className: 'inProgress',
                }),
                classes: {
                    checked: 'checked',
                    disabled: 'disabled',
                },
                size,
                ...restProps,
            }}
        />
    );
};

export default Switch;
