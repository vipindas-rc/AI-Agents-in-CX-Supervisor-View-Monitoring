import type { IAccountExtCredential } from '@ringcx/shared';
import type { i18n } from 'i18next';

import type { UseConfigFormReturn } from '../../../../../hooks/useForm';

export interface IOtherParams {
    control: UseConfigFormReturn<IAccountExtCredential>['control'];
    i18n?: i18n;
}
