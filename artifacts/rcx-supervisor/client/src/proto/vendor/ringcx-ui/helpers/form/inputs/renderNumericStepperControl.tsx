import type { i18n } from 'i18next';
import type { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { NumericStepper } from '../../../components/form/NumericStepper';
import type { INumericStepperProps } from '../../../components/form/NumericStepper';
import { INDETERMINATE_FIELD_VALUE } from '../../../constants';
import { i18next } from '../../../services/translate';
import type { RHFControllerRender } from '../../../types';

interface IRenderNumericStepper
    extends Omit<INumericStepperProps, keyof ControllerRenderProps> {
    dataAid?: string;
    disabled?: boolean;
    i18n?: i18n;
}

export function renderNumericStepperControl({
    dataAid,
    accessibilityLabels,
    i18n = i18next,
    ...props
}: IRenderNumericStepper): RHFControllerRender {
    return ({ field }) => {
        const { t } = useTranslation(undefined, { i18n });

        const isIndeterminateValue = field.value === INDETERMINATE_FIELD_VALUE;

        return (
            <NumericStepper
                {...props}
                {...field}
                value={isIndeterminateValue ? 0 : field.value}
                extraInfo={
                    isIndeterminateValue ? t('GENERICS.LABELS.MULTI_VALUE') : ''
                }
                accessibilityLabels={
                    accessibilityLabels ?? {
                        decrease: t('GENERICS.ACTIONS.DECREASE_VALUE'),
                        increase: t('GENERICS.ACTIONS.INCREASE_VALUE'),
                    }
                }
                data-aid={dataAid}
                id={dataAid}
            />
        );
    };
}
