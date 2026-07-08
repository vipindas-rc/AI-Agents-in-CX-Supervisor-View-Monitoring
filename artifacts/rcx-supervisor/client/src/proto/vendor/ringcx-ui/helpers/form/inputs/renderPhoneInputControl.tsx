import type { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { PhoneInput } from '../../../components/form/PhoneInput';
import type { IPhoneInputProps } from '../../../components/form/PhoneInput';
import { INDETERMINATE_FIELD_VALUE } from '../../../constants';
import { i18next } from '../../../services/translate';
import type { RHFControllerRender } from '../../../types';

export function renderPhoneInputControl({
    message,
    dataAid,
    i18n = i18next,
    ...props
}: Omit<
    IPhoneInputProps,
    keyof Omit<ControllerRenderProps, 'disabled'>
>): RHFControllerRender {
    return ({ field }) => {
        const { t } = useTranslation(undefined, { i18n });

        const isIndeterminateValue = field.value === INDETERMINATE_FIELD_VALUE;

        return (
            <PhoneInput
                message={message}
                error={!!message}
                {...props}
                {...field}
                value={isIndeterminateValue ? '' : field.value}
                placeholder={
                    isIndeterminateValue
                        ? t('GENERICS.LABELS.INPUT_MULTI_VALUE')
                        : ''
                }
                data-aid={dataAid}
            />
        );
    };
}
