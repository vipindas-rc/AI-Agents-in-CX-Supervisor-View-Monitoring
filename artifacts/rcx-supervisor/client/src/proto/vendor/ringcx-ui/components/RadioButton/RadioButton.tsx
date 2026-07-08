import type { FC } from 'react';

import {
    StyledRadio,
    StyledRadioChecked,
    StyledRadioUnchecked,
} from './RadioButton.styled';
import type { IRadioButtonProps } from './types';
import { StyledFormControlLabel } from '../Checkbox/Checkbox.styled';

/**
 * Used to implement the CSS Switch Hack™. Children of this component will be rendered inside the label
 * wrapping the switch, which will make them toggle the checked elements.
 *
 * @param value optional
 * @param color optional
 * @param icon optional
 * @param checkedIcon optional
 * @param RadioProps
 * @constructor
 */
const RadioButton: FC<IRadioButtonProps> = ({
    value,
    color = 'primary',
    icon = <StyledRadioUnchecked />,
    checkedIcon = <StyledRadioChecked />,
    label = null,
    disabled = false,
    ...restProps
}) => {
    const radio = (
        <StyledRadio
            {...{
                value,
                icon,
                color,
                checkedIcon,
                disabled,
                ...restProps,
            }}
            disableRipple
        />
    );
    if (!label) {
        return radio;
    }
    return (
        <StyledFormControlLabel
            disabled={disabled}
            control={radio}
            label={label}
        />
    );
};

export default RadioButton;
