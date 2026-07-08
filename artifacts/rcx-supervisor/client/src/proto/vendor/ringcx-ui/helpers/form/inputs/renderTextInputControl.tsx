import type { InputBaseProps } from '@mui/material/InputBase/InputBase';
import type { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { TextInput } from '../../../components/form/TextInput';
import type { IInputProps } from '../../../components/form/types';
import { INDETERMINATE_FIELD_VALUE } from '../../../constants';
import { i18next } from '../../../services/translate';
import type { RHFControllerRender } from '../../../types';

type IRenderTextInput = Omit<IInputProps, keyof ControllerRenderProps> &
    Pick<ControllerRenderProps, 'disabled'> & {
        dataAid?: string;
        valueCallback?: (
            fieldValue: ControllerRenderProps['value']
        ) => ControllerRenderProps['value'];
        autoComplete?: InputBaseProps['autoComplete'];
    };

export function renderTextInputControl({
    dataAid,
    message,
    valueCallback,
    placeholder,
    i18n = i18next,
    ...props
}: IRenderTextInput): RHFControllerRender {
    return ({ field, fieldState }) => {
        const { t } = useTranslation(undefined, { i18n });
        const isIndeterminateValue = field.value === INDETERMINATE_FIELD_VALUE;

        return (
            <TextInput
                message={message || fieldState.error?.message}
                error={!!message || !!fieldState.error}
                {...field}
                {...props}
                value={
                    isIndeterminateValue
                        ? ''
                        : valueCallback
                          ? valueCallback(field.value)
                          : field.value == null
                            ? ''
                            : field.value
                }
                placeholder={
                    isIndeterminateValue
                        ? t('GENERICS.LABELS.INPUT_MULTI_VALUE')
                        : placeholder
                }
                data-aid={dataAid}
            />
        );
    };
}
