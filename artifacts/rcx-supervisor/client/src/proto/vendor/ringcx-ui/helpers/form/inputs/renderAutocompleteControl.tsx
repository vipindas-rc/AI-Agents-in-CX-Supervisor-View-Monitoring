import type { ReactNode } from 'react';
import { useMemo } from 'react';

import type { AutocompleteRenderGetTagProps } from '@mui/material';
import type { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import type {
    IAutocompleteProps,
    IOption,
} from '../../../components/form/Autocomplete';
import { Autocomplete } from '../../../components/form/Autocomplete';
import { INDETERMINATE_FIELD_VALUE } from '../../../constants';
import { i18next } from '../../../services/translate';
import type { RHFControllerRender } from '../../../types';

type IRenderAutocomplete<T> = Pick<IAutocompleteProps<T>, 'data' | 'disabled'> &
    Omit<IAutocompleteProps<T>, keyof ControllerRenderProps | 'renderTags'> & {
        onChange?: ControllerRenderProps['onChange'];
        dataAid?: string;
        hideError?: boolean;
        renderTags?:
            | ((
                  value: IOption<T>[],
                  getTagProps: AutocompleteRenderGetTagProps,
                  onChange: ControllerRenderProps['onChange']
              ) => ReactNode)
            | undefined;
    };

export function renderAutocompleteControl<T>({
    onChange,
    dataAid,
    message,
    placeholder,
    renderTags,
    i18n = i18next,
    onInputChange,
    inputClass,
    hideError = false,
    ...props
}: IRenderAutocomplete<T>): RHFControllerRender {
    return ({ field, fieldState }) => {
        const { t } = useTranslation(undefined, { i18n });

        const isIndeterminateValue = field.value === INDETERMINATE_FIELD_VALUE;

        const handleChange = onChange || field.onChange;

        const handleRenderTags = useMemo(() => {
            if (!renderTags) return;

            return (
                value: IOption<T>[],
                getTagProps: AutocompleteRenderGetTagProps
            ) => {
                return renderTags(value, getTagProps, handleChange);
            };
        }, [handleChange]);

        return (
            <Autocomplete
                message={hideError ? '' : message || fieldState.error?.message}
                error={hideError ? false : !!message || !!fieldState.error}
                {...field}
                {...props}
                onChange={handleChange}
                value={isIndeterminateValue ? '' : (field.value ?? null)}
                placeholder={
                    isIndeterminateValue
                        ? t('GENERICS.LABELS.INPUT_MULTI_VALUE')
                        : placeholder
                }
                inputClass={'auto-complete-input'}
                //TODO: This will be fixed by updating to React 19 and removing the forwardRef as forwardRef cannot be made genetic
                // component receives T from forwardRef render function
                //@ts-ignore
                renderTags={handleRenderTags}
                data-aid={dataAid}
                onInputChange={onInputChange}
            />
        );
    };
}
