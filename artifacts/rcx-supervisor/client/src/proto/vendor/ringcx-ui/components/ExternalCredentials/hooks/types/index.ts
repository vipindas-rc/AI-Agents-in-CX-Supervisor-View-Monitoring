import type { ReactNode } from 'react';

import type { IAccountExtCredential } from '@ringcx/shared';
import type { i18n } from 'i18next';

import type { UseConfigFormReturn } from '../../../../hooks/useForm/types';

export type ExternalModalFormChange = (
    value: string,
    getValues: UseConfigFormReturn<IAccountExtCredential>['getValues'],
    setValue: UseConfigFormReturn<IAccountExtCredential>['setValue']
) => void;
export interface IExternalModalFormData {
    data: any;
    dataAdditional: boolean;
    isSearchable?: boolean;
    initial?: boolean;
    onChange?: ExternalModalFormChange;
}

// MODALS
export type UseExtCredentialSaveModal = (options: {
    onSubmit: (extCredential: IAccountExtCredential) => void;
    i18n?: i18n;
    loading?: boolean;
    externalModalFormData?: Record<string, IExternalModalFormData>;
    openHook?: () => Promise<void>;
}) => {
    renderSaveModal: ReactNode;
    showSaveModal(extCredential?: IAccountExtCredential): void;
};
