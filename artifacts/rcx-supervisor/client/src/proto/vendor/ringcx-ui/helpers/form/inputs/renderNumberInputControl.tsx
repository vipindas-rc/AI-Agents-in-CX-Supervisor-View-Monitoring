import type { i18n } from 'i18next';
import type { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { INumberInputProps } from '../../../components/form/NumberInput';
import { NumberInput } from '../../../components/form/NumberInput';
import { INDETERMINATE_FIELD_VALUE } from '../../../constants';
import { i18next } from '../../../services/translate';
import type { RHFControllerRender } from '../../../types';

interface IRenderNumberInput
    extends Omit<
        INumberInputProps,
        keyof ControllerRenderProps | 'message' | 'error'
    > {
    error?: string;
    dataAid?: string;
    disabled?: boolean;
    i18n?: i18n;
}

export function renderNumberInputControl({
    dataAid,
    error,
    i18n = i18next,
    ...props
}: IRenderNumberInput): RHFControllerRender {
    return ({ field }) => {
        const { t } = useTranslation(undefined, { i18n });

        const isIndeterminateValue = field.value === INDETERMINATE_FIELD_VALUE;

        return (
            <NumberInput
                message={error}
                error={!!error}
                {...props}
                {...field}
                value={isIndeterminateValue ? '' : field.value}
                placeholder={
                    isIndeterminateValue ? t('GENERICS.LABELS.MULTI_VALUE') : ''
                }
                data-aid={dataAid}
            />
        );
    };
}
