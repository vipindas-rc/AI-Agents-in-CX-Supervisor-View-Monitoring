import type { i18n } from 'i18next';

import type { IAutocompleteProps } from '../../Autocomplete';

export type ExternalCredentialsDropDownProps = IAutocompleteProps & {
    accountId: string;
    afterCreated?: (success: boolean) => Promise<void>;
    showMessages?: {
        success: (message: string) => void;
        error: (message: string) => void;
    };
    dataAid?: string;
    disabled?: boolean;
    showCreateButton?: boolean;
    i18n?: i18n;
};

export enum AuthInputType {
    secret = 'secret',
}
export enum AuthInputTypeMapping {
    'secret' = 'password',
}
