import type { ForwardedRef, SyntheticEvent } from 'react';
import { useCallback, useEffect, useState, forwardRef, Fragment } from 'react';

import { Autocomplete as AutocompleteUI, Box } from '@mui/material';
import type { PopperProps } from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';

import {
    AutoCompleteWrapper,
    FooterMessage,
    ListGroupHeading,
    SecondaryDisplayName,
    StyledPopper,
    StyledTextField,
    StyledTooltip,
} from './Autocomplete.styled';
import type { IAutocompleteProps, IOption } from './types';
import { TEST_AID } from '../../../constants';
import { Arrow } from '../../../icons/Arrow';
import { CloseSvg } from '../../../icons/CloseSvg';
import { Filter } from '../../../icons/Filter';
import { i18next } from '../../../services/translate';
import { materialTheme, themeV4toV5 } from '../../../theme/theme';
import Spinner from '../../Spinner';
import { TextEclipse } from '../../TextEclipse';
import { TooltipAdornment } from '../Input.styled';
import { VisuallyHiddenLabel } from '../VisuallyHiddenLabel';

/**
 *@deprecated
 * DO NOT USE THIS DIRECTLY, use renderAutocompleteControl helper instead
 */
const Autocomplete = forwardRef<HTMLInputElement, IAutocompleteProps<unknown>>(
    <T,>(
        {
            label,
            tooltipIcon,
            data,
            value,
            onChange,
            onOpen,
            onClose,
            filterOptions,
            groupBy,
            message,
            error,
            placeholder,
            expandedPlaceholder,
            loading = false,
            disableClearable = true,
            required,
            noOptionsText,
            renderOption,
            multiple,
            getInputProps,
            blurOnSelect = true,
            inputClass,
            showFilterIcon,
            inputId = '',
            ariaLabelText = '',
            accessibleLabel,
            i18n = i18next,
            open,
            popupIcon = <Arrow />,
            filterSelectedOptions = false,
            hideEndAdornment = false,
            maxHeight,
            enablePopperFlip = false,
            ...restProps
        }: IAutocompleteProps<T>,
        ref: ForwardedRef<HTMLInputElement>
    ) => {
        const { t } = useTranslation(undefined, { i18n });
        const [localValue, setLocalValue] =
            useState<Nullable<IOption<T> | IOption<T>[]>>();
        const NO_OPTION_TEXT = t('GENERICS.LABELS.NO_OPTIONS_TEXT');

        useEffect(() => {
            if (data && restProps.defaultValue === undefined) {
                if (multiple) {
                    const selectedValue = data.filter(
                        ({ id }) => value && value.includes(id)
                    );
                    setLocalValue(selectedValue || null);
                } else {
                    const selectedValue = data.find(({ id }) => id === value);
                    setLocalValue(selectedValue || null);
                }
            }
        }, [value, data, multiple, restProps.defaultValue]);

        const handleChange = useCallback(
            (
                _: SyntheticEvent,
                newValue:
                    | NonNullable<string | IOption<T>>
                    | (string | IOption<T>)[]
                    | null
            ) => {
                if (typeof newValue === 'string') {
                    onChange(newValue);
                    return;
                }
                if (Array.isArray(newValue)) {
                    onChange(
                        newValue.map((item) =>
                            typeof item === 'string' ? item : item.id
                        )
                    );
                    return;
                }

                onChange(newValue?.id);
            },
            [onChange]
        );

        const checkOptionEqualToValue = (
            option: IOption<T>,
            value: IOption<T>
        ) => option?.id === value?.id;

        const controlled = open !== undefined;

        const [isOpenState, setIsOpen] = useState(false);
        let isOpen = isOpenState;

        let openCallback = useCallback(() => {
            setIsOpen(true);
            onOpen?.();
        }, [onOpen]);

        let closeCallback = useCallback(() => {
            setIsOpen(false);
            onClose?.();
        }, [onClose]);

        if (controlled) {
            isOpen = open;
            openCallback = () => onOpen?.();
            closeCallback = () => onClose?.();
        }

        const renderPopperComponent = useCallback(
            (props: PopperProps) => {
                const modifiers = [
                    {
                        name: 'flip',
                        options: enablePopperFlip
                            ? {
                                  fallbackPlacements: ['top'],
                              }
                            : {
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
            },
            [enablePopperFlip]
        );

        const renderAutocomplete = () => (
            <Fragment>
                <AutocompleteUI
                    {...restProps}
                    multiple={multiple}
                    componentsProps={{
                        // bug with the useModal dialog component,
                        // popper shows behind the dialog because dialog z-index is set to 9999
                        popper: { sx: { zIndex: materialTheme.zIndex.modal } },
                        clearIndicator: {
                            tabIndex: 0,
                        },
                    }}
                    ChipProps={{
                        tabIndex: 0,
                        onKeyDown: (event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                const chipElement =
                                    event.currentTarget as HTMLElement;
                                const tagIndex =
                                    chipElement.getAttribute('data-tag-index');
                                if (tagIndex !== null) {
                                    const currentValue =
                                        localValue as IOption<T>[];
                                    const index = parseInt(tagIndex, 10);
                                    const optionToRemove = currentValue[index];
                                    if (optionToRemove) {
                                        const newValues = currentValue.filter(
                                            (_, i) => i !== index
                                        );
                                        setLocalValue(newValues);
                                        onChange(
                                            newValues.map((item) => item.id)
                                        );
                                    }
                                }
                            }
                        },
                    }}
                    ListboxProps={{
                        ...restProps.ListboxProps,
                        ...(maxHeight && { style: { maxHeight } }),
                    }}
                    value={localValue}
                    options={data}
                    noOptionsText={noOptionsText || NO_OPTION_TEXT}
                    autoComplete={false}
                    onChange={handleChange}
                    groupBy={groupBy}
                    loading={loading}
                    isOptionEqualToValue={checkOptionEqualToValue}
                    disableClearable={disableClearable}
                    blurOnSelect={blurOnSelect}
                    open={isOpen}
                    onOpen={openCallback}
                    onClose={closeCallback}
                    PopperComponent={renderPopperComponent}
                    {...(filterOptions && {
                        filterOptions,
                    })}
                    filterSelectedOptions={filterSelectedOptions}
                    fullWidth
                    renderOption={(props, option) => {
                        if (option.hidden) {
                            return;
                        }
                        return (
                            (renderOption && renderOption(props, option)) ||
                            (option.isFooterMessage ? (
                                <FooterMessage
                                    showTopBorder={option.showTopBorder}
                                >
                                    <TextEclipse
                                        tooltipMsg={option?.label}
                                        placement={option?.infoTextPlacement}
                                        // bug with the useModal dialog component,
                                        // popper shows behind the dialog because dialog z-index is set to 9999
                                        popperProps={{
                                            style: { zIndex: 9999 },
                                        }}
                                    >
                                        {option?.label}
                                    </TextEclipse>
                                </FooterMessage>
                            ) : (
                                <Box component='li' {...props} key={option.id}>
                                    <TextEclipse
                                        tooltipMsg={
                                            option?.optionDisplayName ||
                                            option?.label
                                        }
                                        // bug with the useModal dialog component,
                                        // popper shows behind the dialog because dialog z-index is set to 9999
                                        popperProps={{
                                            style: { zIndex: 9999 },
                                        }}
                                    >
                                        {option?.optionDisplayName ||
                                            option?.label}
                                        {option?.secondaryDisplayName && (
                                            <SecondaryDisplayName
                                                selectedOption={checkOptionEqualToValue(
                                                    localValue as IOption<T>,
                                                    option
                                                )}
                                            >
                                                {option.secondaryDisplayName}
                                            </SecondaryDisplayName>
                                        )}
                                    </TextEclipse>
                                </Box>
                            ))
                        );
                    }}
                    renderGroup={(props) => {
                        return (
                            <li key={props.key}>
                                {props.group && (
                                    <ListGroupHeading
                                        data-aid={
                                            TEST_AID.AUTOCOMPLETE.GROUP_HEADER
                                        }
                                    >
                                        {props.group}
                                    </ListGroupHeading>
                                )}
                                {props.children}
                            </li>
                        );
                    }}
                    renderInput={(params) => (
                        <Fragment>
                            {!label && (
                                <VisuallyHiddenLabel htmlFor={inputId}>
                                    {accessibleLabel || ariaLabelText}
                                </VisuallyHiddenLabel>
                            )}
                            <StyledTextField
                                {...params}
                                error={error}
                                helperText={message}
                                label={label}
                                $isOpen={isOpen}
                                InputLabelProps={{ shrink: true }}
                                placeholder={
                                    isOpen && expandedPlaceholder
                                        ? expandedPlaceholder
                                        : placeholder
                                }
                                required={required}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <Fragment>
                                            {showFilterIcon && <Filter />}
                                            {params.InputProps.startAdornment}
                                        </Fragment>
                                    ),
                                    endAdornment: (
                                        <Fragment>
                                            {loading && (
                                                <Spinner size='small' />
                                            )}
                                            {!hideEndAdornment &&
                                                params.InputProps.endAdornment}
                                        </Fragment>
                                    ),
                                    ...(localValue &&
                                        getInputProps &&
                                        getInputProps(localValue)),
                                    className:
                                        params.InputProps.className +
                                        (inputClass ? ` ${inputClass}` : ''),
                                }}
                                inputProps={{
                                    ...params.inputProps,
                                    id:
                                        !label && inputId
                                            ? inputId
                                            : params.inputProps.id,
                                }}
                                ref={ref}
                            />
                        </Fragment>
                    )}
                    sx={{
                        '.MuiOutlinedInput-root': {
                            gap: '4px',
                        },
                        '&.Mui-expanded .MuiOutlinedInput-root': {
                            // Increased specificity
                            border: 'none !important',
                            boxShadow:
                                'rgba(171, 171, 171, 0.5) 0px 2px 12px 0px !important',
                        },
                    }}
                    popupIcon={!loading && popupIcon}
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
            <ThemeProvider theme={themeV4toV5}>
                <AutoCompleteWrapper>
                    {(localValue !== undefined ||
                        restProps.defaultValue !== undefined) &&
                        renderAutocomplete()}
                </AutoCompleteWrapper>
            </ThemeProvider>
        );
    }
);

export default Autocomplete;
