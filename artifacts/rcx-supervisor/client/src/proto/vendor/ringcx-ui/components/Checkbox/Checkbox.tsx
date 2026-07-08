import type { FC } from 'react';
import { Fragment, useMemo } from 'react';

import CheckedIcon from './assets/CheckedIcon';
import DefaultIcon from './assets/DefaultIcon';
import IndeterminateIcon from './assets/IndeterminateIcon';
import {
    StyledCheckbox,
    StyledFormControlLabel,
    StyledLabelWrapper,
} from './Checkbox.styled';
import type { ICheckboxProps } from './types';
import Adornment from '../Adornment';
import { InputSize } from '../constants/InputSize';

const Checkbox: FC<ICheckboxProps> = ({
    value,
    size = InputSize.DEFAULT,
    icon = <DefaultIcon fontSize={size} />,
    checkedIcon = <CheckedIcon fontSize={size} />,
    indeterminateIcon = <IndeterminateIcon fontSize={size} />,
    color = 'primary',
    label = null,
    disabled = false,
    endAdornment,
    dataAid,
    ...restProps
}) => {
    const checkbox = (
        <StyledCheckbox
            {...{
                value,
                icon,
                checkedIcon,
                indeterminateIcon,
                color,
                disabled,
                disableRipple: true,
                ...restProps,
                ...(dataAid ? { 'data-aid': `${dataAid}_checkbox` } : {}),
            }}
        />
    );

    const checkboxEndAdornment = useMemo(() => {
        if (!endAdornment) {
            return;
        }

        if (Object.keys(endAdornment).length) {
            return (
                <Adornment
                    tooltipMessage={endAdornment.tooltipMessage}
                    tooltipPopperProps={endAdornment.tooltipPopperProps}
                    icon={endAdornment.icon}
                    size={'small'}
                    placement={endAdornment.placement}
                    inline={endAdornment.inline}
                />
            );
        }

        return endAdornment;
    }, [endAdornment]);

    return label ? (
        <StyledLabelWrapper data-aid={dataAid}>
            <Fragment>
                <StyledFormControlLabel
                    control={checkbox}
                    disabled={disabled}
                    label={
                        <Fragment>
                            {dataAid ? (
                                <span data-aid={`${dataAid}_label`}>
                                    {label}
                                </span>
                            ) : (
                                label
                            )}
                            {endAdornment &&
                                endAdornment.inline &&
                                (checkboxEndAdornment as unknown as JSX.Element)}
                        </Fragment>
                    }
                />
                {endAdornment &&
                    !endAdornment.inline &&
                    (checkboxEndAdornment as unknown as JSX.Element)}
            </Fragment>
        </StyledLabelWrapper>
    ) : (
        checkbox
    );
};

export default Checkbox;
