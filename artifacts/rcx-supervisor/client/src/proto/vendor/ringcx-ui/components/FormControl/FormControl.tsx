import { Fragment, type FC, type PropsWithChildren } from 'react';

import {
    StyledMessage,
    StyledTitle,
    StyledFormControl,
    StyledHeader,
} from './FormControl.styled';
import type { IFormControl } from './types';
import { Information } from '../../icons/Information';
import Adornment from '../Adornment';
import Tooltip from '../Tooltip';

const FormControl: FC<PropsWithChildren<IFormControl>> = ({
    children,
    title,
    required = false,
    error,
    message,
    formWidth,
    endAdornment,
    legacyMode,
    highlightError = true,
    size = 'small',
    dataAid,
    tooltip,
    fieldKey,
    showRequiredAsterisk = false,
    ...props
}) => {
    const labelId = dataAid ? `${dataAid}-label` : undefined;

    if (legacyMode) {
        return (
            <StyledFormControl
                formWidth={formWidth}
                error={error || required}
                highlightError={error}
                required={required}
                data-aid={dataAid}
                {...props}
            >
                <StyledHeader>
                    {title && (
                        <StyledTitle
                            id={labelId}
                            required={showRequiredAsterisk}
                            htmlFor={dataAid}
                        >
                            {title}
                            {endAdornment &&
                                Object.keys(endAdornment).length && (
                                    <Adornment
                                        tooltipMessage={
                                            endAdornment.tooltipMessage
                                        }
                                        icon={endAdornment.icon}
                                        size={size}
                                        placement={endAdornment.placement}
                                        legacyMode={legacyMode}
                                    />
                                )}
                        </StyledTitle>
                    )}
                    {message && (error || required) && (
                        <StyledMessage
                            id={fieldKey ? `error-${fieldKey}` : undefined}
                            role={error ? 'alert' : 'status'}
                        >
                            {message}
                        </StyledMessage>
                    )}
                </StyledHeader>
                {children}
            </StyledFormControl>
        );
    }

    const PopperProps = {
        disablePortal: true,
        modifiers: {
            preventOverflow: {
                enabled: true,
            },
        },
    };

    const titleNode = tooltip ? (
        <Fragment>
            <span>{title}</span>
            <Tooltip
                placement={tooltip.placement || 'right'}
                title={tooltip.message}
                PopperProps={PopperProps}
                data-aid='fieldNameTooltip'
            >
                <span
                    style={
                        tooltip.placement === 'right' || !tooltip.placement
                            ? { float: 'right' }
                            : {}
                    }
                >
                    <Information />
                </span>
            </Tooltip>
        </Fragment>
    ) : (
        title
    );

    return (
        <StyledFormControl
            formWidth={formWidth}
            error={error}
            highlightError={highlightError}
            required={required}
            data-aid={dataAid}
            {...props}
        >
            {title && (
                <StyledTitle
                    id={labelId}
                    required={required}
                    fitContent={!!tooltip}
                    htmlFor={dataAid}
                    className='form-control-label'
                >
                    {titleNode}
                </StyledTitle>
            )}
            {children}
            {message && (
                <StyledMessage
                    className='error-message'
                    id={fieldKey ? `error-${fieldKey}` : undefined}
                    role={error ? 'alert' : required ? 'status' : undefined}
                >
                    {message}
                </StyledMessage>
            )}
        </StyledFormControl>
    );
};

export default FormControl;
