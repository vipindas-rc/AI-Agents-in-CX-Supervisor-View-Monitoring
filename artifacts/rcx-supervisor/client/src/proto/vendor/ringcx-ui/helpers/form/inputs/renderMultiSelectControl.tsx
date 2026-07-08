import type { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { MultiSelect } from '../../../components/DropDown';
import type { IMultiSelectProps } from '../../../components/DropDown/types';
import { i18next } from '../../../services/translate';
import type { RHFControllerRender } from '../../../types';

type IRenderMultiSelect = Omit<
    IMultiSelectProps,
    keyof ControllerRenderProps | 'message' | 'error'
> & {
    onChange?: ControllerRenderProps['onChange'];
    message?: string;
    error?: boolean;
    hideError?: boolean;
    disabled?: boolean;
};

export function renderMultiSelectControl({
    onChange,
    placeholder,
    message = '',
    hideError = false,
    disabled = false,
    i18n = i18next,
    ...props
}: IRenderMultiSelect): RHFControllerRender {
    return ({ field, fieldState }) => {
        const { t } = useTranslation(undefined, { i18n });

        const handleChange = onChange || field.onChange;

        return (
            <MultiSelect
                {...field}
                {...props}
                error={hideError ? false : !!message || !!fieldState.error}
                message={
                    hideError ? '' : message || fieldState.error?.message || ''
                }
                onChange={handleChange}
                selectedItemsIds={field.value || []}
                placeholder={
                    placeholder || t('GENERICS.LABELS.INPUT_MULTI_VALUE')
                }
                disabled={disabled}
            />
        );
    };
}
