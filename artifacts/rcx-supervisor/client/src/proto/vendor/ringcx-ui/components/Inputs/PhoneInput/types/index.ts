import type { TooltipProps } from '@material-ui/core/Tooltip';

import type { ITextInput } from '../../TextInput/types';

type ErrorType = {
    isInvalid: boolean;
    isEmpty: boolean;
    isUnavailableCountryId: boolean;
};

export type PhoneInputType = {
    forceParse?: boolean;
    enableValidation?: boolean;
    enableCalculateOnDisable?: boolean;
    legacyMode?: boolean;
    availableCountryIds?: number[];
    errorMessage?: string;
    requiredMessage?: string;
    countryRestrictionMessage?: string;
    helpMessage?: string;
    allowShortNumber?: boolean;
    onError?: (error: ErrorType) => void;
    onChange?: (value: string, hasError: boolean) => void;
    placement?: TooltipProps['placement'];
    showRequiredAsterisk?: boolean;
} & Omit<ITextInput, 'onChange'>;
