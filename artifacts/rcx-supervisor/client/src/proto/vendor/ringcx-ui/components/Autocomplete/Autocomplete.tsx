import type { SyntheticEvent } from 'react';
import { Fragment, forwardRef, useCallback, useEffect, useState } from 'react';

import {
    Autocomplete as AutocompleteUI,
    type PopperProps,
} from '@mui/material';

import {
    AutoCompleteWrapper,
    StyledBox,
    StyledDisplayName,
    StyledPopper,
    StyledTextField,
    StyledTooltip,
    TooltipAdornment,
} from './Autocomplete.styled';
import type { IAutocompleteProps, IAutocompleteItem } from './types';
import { Arrow, CloseSvg } from '../../icons';
import Spinner from '../Spinner';

const Autocomplete = forwardRef<HTMLInputElement, IAutocompleteProps>(
    (
        {
            label,
            tooltipIcon,
            data,
            value,
            onChange,
            onOpen,
            filterOptions,
            groupBy,
            message,
            error,
            placeholder,
            loading = false,
            disableClearable = true,
            required,
            loadingText,
            noOptionsText,
            callbackParam,
            ...restProps
        },
        ref
    ) => {
        const [localValue, setLocalValue] =
            useState<IAutocompleteItem | null>();

        useEffect(() => {
            if (data) {
                const selectedValue = data.find(({ id }) => id === value);
                setLocalValue(selectedValue || null);
            }
        }, [value, data]);

        const handleChange = useCallback(
            (_: SyntheticEvent, newValue: IAutocompleteItem | null) => {
                // For angularjs need some callback params
                if (callbackParam !== undefined) {
                    onChange(newValue ? newValue.id : null, callbackParam);
                } else {
                    onChange(newValue ? newValue.id : null);
                }
            },
            [onChange]
        );

        const checkOptionEqualToValue = (
            option: IAutocompleteItem,
            val: IAutocompleteItem
        ) => option.id === val.id;

        const renderPopperComponent = useCallback((props: PopperProps) => {
            const modifiers = [
                {
                    name: 'flip',
                    options: {
                        fallbackPlacements: [],
                    },
                },
            ];

            return (
                <StyledPopper
                    {...props}
                    modifiers={modifiers}
                    popperOptions={{
                        placement: 'bottom',
                    }}
                />
            );
        }, []);

        const renderAutocomplete = () => (
            <Fragment>
                <AutocompleteUI
                    {...restProps}
                    componentsProps={{
                        popper: { sx: { zIndex: 9999 } },
                    }}
                    value={localValue}
                    options={data}
                    autoComplete={false}
                    onChange={handleChange}
                    groupBy={groupBy}
                    loading={loading}
                    noOptionsText={noOptionsText}
                    loadingText={loadingText}
                    isOptionEqualToValue={checkOptionEqualToValue}
                    disableClearable={disableClearable}
                    blurOnSelect={true}
                    PopperComponent={renderPopperComponent}
                    {...(filterOptions && {
                        filterOptions,
                    })}
                    fullWidth
                    renderOption={(props, option: IAutocompleteItem) => (
                        <StyledBox
                            component='li'
                            {...props}
                            sx={{
                                '& span:last-child': {
                                    color:
                                        option?.id === localValue?.id
                                            ? 'white'
                                            : '#A1A1A1',
                                },
                            }}
                        >
                            <span>{option?.label}</span>
                            <span>{option?.optionDisplayName}</span>
                        </StyledBox>
                    )}
                    renderInput={(params) => (
                        <StyledTextField
                            {...params}
                            error={error}
                            helperText={message}
                            label={label}
                            InputLabelProps={{ shrink: true }}
                            placeholder={placeholder}
                            required={required}
                            InputProps={{
                                ...params.InputProps,
                                endAdornment: (
                                    <Fragment>
                                        <StyledDisplayName>
                                            {localValue?.optionDisplayName}
                                        </StyledDisplayName>
                                        <span>
                                            {params.InputProps.endAdornment}
                                        </span>
                                        {loading && <Spinner size='small' />}
                                    </Fragment>
                                ),
                            }}
                            ref={ref}
                        />
                    )}
                    sx={{
                        '&.Mui-expanded .MuiOutlinedInput-root': {
                            border: 'none !important',
                            boxShadow:
                                'rgba(171, 171, 171, 0.5) 0px 2px 12px 0px !important',
                        },
                    }}
                    popupIcon={<Arrow />}
                    clearIcon={<CloseSvg />}
                />
                {tooltipIcon && (
                    <StyledTooltip title={tooltipIcon.message} arrow>
                        <TooltipAdornment>{tooltipIcon.icon}</TooltipAdornment>
                    </StyledTooltip>
                )}
            </Fragment>
        );
        return (
            <AutoCompleteWrapper>
                {localValue !== undefined && renderAutocomplete()}
            </AutoCompleteWrapper>
        );
    }
);

export default Autocomplete;
