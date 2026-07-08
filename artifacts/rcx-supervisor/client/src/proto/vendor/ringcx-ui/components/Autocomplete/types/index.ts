import type { ReactNode } from 'react';

import type { FilterOptionsState } from '@mui/material';
import type { ControllerRenderProps } from 'react-hook-form';

export interface IAutocompleteItem {
    id: string | number;
    label: string;
    optionDisplayName?: string;
    groupName?: string;
}

export interface IAutocompleteProps extends ControllerRenderProps {
    label?: string;
    data: IAutocompleteItem[];
    error?: boolean;
    message?: string;
    disabled?: boolean;
    loading?: boolean;
    disableClearable?: boolean;
    loadingText?: string;
    noOptionsText?: string;
    filterOptions?: (
        options: IAutocompleteItem[],
        state: FilterOptionsState<IAutocompleteItem>
    ) => IAutocompleteItem[];
    onOpen?: () => void;
    groupBy?: (value: IAutocompleteItem) => string;
    tooltipIcon?: {
        message: string;
        icon: ReactNode;
    };
    placeholder?: string;
    required?: boolean;
    callbackParam?: string | number;
}
