import type { IAccountExtCredential } from '@ringcx/shared';
import type { i18n } from 'i18next';

import type { UseConfigFormReturn } from '../../../../../hooks/useForm';
import type { IMenuItem } from '../../../../DropDown';
import type { IToolTipProps } from '../../../../Tooltip/types/Tooltip';
import type { IExternalModalFormData } from '../../../hooks';

export interface IExtCredentialForm {
    control: UseConfigFormReturn<IAccountExtCredential>['control'];
    getValues: UseConfigFormReturn<IAccountExtCredential>['getValues'];
    clearErrors: UseConfigFormReturn<IAccountExtCredential>['clearErrors'];
    formState: UseConfigFormReturn<IAccountExtCredential>['formState'];
    setValue: UseConfigFormReturn<IAccountExtCredential>['setValue'];
    isEdit?: boolean;
    i18n?: i18n;
    externalModalFormData?: Record<string, IExternalModalFormData>;
}

export interface IFormField {
    required?: boolean | string;
    dependentField?: string;
    dependentValue?: string[];
    control: string;
    type?: string;
    title: string;
    name: string;
    data?: IMenuItem[];
    onChange?: (value: any) => void;
    testAid?: string;
    disabled?: boolean;
    min?: number;
    max?: number;
    extraTexts?: Record<string, string>;
    fieldNameTooltip?: {
        message: string;
        placement?: IToolTipProps['placement'];
    };
    isVisible?: (data: IAccountExtCredential) => boolean;
    url?: string;
}

export interface IFunctionList {
    id: string;
    displayName: string;
    workflowFunctionGroupId: string;
}
