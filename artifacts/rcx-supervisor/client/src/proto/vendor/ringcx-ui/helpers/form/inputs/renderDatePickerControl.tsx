import { DateTime } from '@ringcx/shared';
import type { i18n } from 'i18next';
import type { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type { IDatePickerProps } from '../../../components';
import { DatePicker } from '../../../components/Inputs/DatePicker';
import { INDETERMINATE_FIELD_VALUE } from '../../../constants';
import { i18next } from '../../../services/translate';
import type { RHFControllerRender } from '../../../types';

type IRenderDatePicker = Omit<
    IDatePickerProps,
    keyof ControllerRenderProps | 'error' | 'canClear' | 'title'
> & {
    onChange?: ControllerRenderProps['onChange'];
    dataAid?: string;
    message?: string;
    disableClearable?: boolean;
    label?: string;
    disabled?: boolean;
    i18n?: i18n;
};

export const DATE_POPPER_ZINDEX = 10000;

export function renderDatePickerControl({
    label,
    onChange,
    dataAid,
    message,
    placeholder,
    disableClearable = false,
    disabled,
    i18n = i18next,
    ...props
}: IRenderDatePicker): RHFControllerRender {
    return ({ field, fieldState }) => {
        const { t } = useTranslation(undefined, { i18n });

        const isIndeterminateValue = field.value === INDETERMINATE_FIELD_VALUE;

        const handleChange = onChange || field.onChange;

        return (
            <DatePicker
                title={label}
                helperText={message || fieldState.error?.message}
                error={!!message || !!fieldState.error}
                {...field}
                {...props}
                onChange={handleChange}
                value={isIndeterminateValue ? null : (field.value ?? null)}
                placeholder={
                    isIndeterminateValue
                        ? t('GENERICS.LABELS.INPUT_MULTI_VALUE')
                        : placeholder
                }
                canClear={!disableClearable}
                popperZindex={DATE_POPPER_ZINDEX}
                timezone={DateTime.getUserTimezone()}
                locale={DateTime.getUserLocale()}
                disabled={disabled}
            />
        );
    };
}
