import type { HTMLAttributes, ReactNode } from 'react';

import type {
    AutocompleteRenderGetTagProps,
    FilterOptionsState,
    AutocompleteInputChangeReason,
} from '@mui/material';
import type { OutlinedInputProps } from '@mui/material/OutlinedInput';
import type { i18n } from 'i18next';
import type { ControllerRenderProps } from 'react-hook-form';

import type { IToolTipProps } from '../../../Tooltip/types/Tooltip';

export interface IOption<T = undefined> {
    id: Nullable<string | number>;
    label: string;
    optionDisplayName?: string;
    groupName?: string;
    groupDisplayName?: string;
    options?: T;
    secondaryDisplayName?: string;
    isFooterMessage?: boolean;
    showTopBorder?: boolean;
    hidden?: boolean;
    infoTextPlacement?: IToolTipProps['placement'];
}

export interface IAutocompleteProps<T> extends ControllerRenderProps {
    label?: string;
    data: IOption<T>[];
    error?: boolean;
    message?: string;
    disabled?: boolean;
    loading?: boolean;
    disableClearable?: boolean;
    filterOptions?: (
        options: IOption<T>[],
        state: FilterOptionsState<IOption<T>>
    ) => IOption<T>[];
    open?: boolean;
    onOpen?: () => void;
    onClose?: () => void;
    openText?: string;
    groupBy?: (value: IOption<T>) => string;
    tooltipIcon?: {
        message: string;
        icon: ReactNode;
    };
    placeholder?: string;
    expandedPlaceholder?: string;
    required?: boolean;
    noOptionsText?: string;
    renderOption?: (
        props: HTMLAttributes<HTMLLIElement>,
        option: IOption<T>
    ) => ReactNode;
    renderTags?: (
        value: IOption<T>[],
        getTagProps: AutocompleteRenderGetTagProps
    ) => ReactNode;
    getOptionLabel?: (option: IOption<T>) => string;
    multiple?: boolean;
    getInputProps?: (
        value: IOption<T> | IOption<T>[]
    ) => Partial<OutlinedInputProps>;
    defaultValue?: IOption<T>;
    ListboxComponent?: React.JSXElementConstructor<
        React.HTMLAttributes<HTMLElement>
    >;
    ListboxProps?: Record<string, any>;
    onInputChange?: (
        event: React.SyntheticEvent,
        value: string,
        reason: AutocompleteInputChangeReason
    ) => void;
    disableListWrap?: boolean;
    clearOnBlur?: boolean;
    blurOnSelect?: boolean;
    inputClass?: string;
    showFilterIcon?: boolean;
    inputValue?: string;
    inputId?: string;
    ariaLabelText?: string;
    accessibleLabel?: string;
    i18n?: i18n;
    filterSelectedOptions?: boolean;
    popupIcon?: ReactNode;
    hideEndAdornment?: boolean;
    maxHeight?: string;
    enablePopperFlip?: boolean;
}
