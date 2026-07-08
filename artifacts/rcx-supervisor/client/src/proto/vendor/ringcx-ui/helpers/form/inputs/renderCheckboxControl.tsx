import { Fragment, useMemo } from 'react';

import { Box } from '@mui/material';
import type { i18n } from 'i18next';
import type { ControllerRenderProps } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FormCheckbox } from '../../../components/form/FormCheckbox';
import type { FormCheckboxProps } from '../../../components/form/FormCheckbox';
import { INDETERMINATE_FIELD_VALUE } from '../../../constants';
import { i18next } from '../../../services/translate';
import { theme } from '../../../theme';
import type { RHFControllerRender } from '../../../types';

interface IRenderCheckbox
    extends Omit<FormCheckboxProps, keyof ControllerRenderProps> {
    dataAid?: string;
    disabled?: boolean;
    labelCompensation?: boolean;
    onChange?: ControllerRenderProps['onChange'];
    margin?: number;
    i18n?: i18n;
}

export function renderCheckboxControl({
    label,
    dataAid,
    labelCompensation,
    onChange,
    margin = 20,
    i18n = i18next,
    ...props
}: IRenderCheckbox): RHFControllerRender {
    return ({ field }) => {
        const { t } = useTranslation(undefined, { i18n });

        const isIndeterminateValue = field.value === INDETERMINATE_FIELD_VALUE;

        const disabled = props.disabled || field.disabled;

        const resLabel = useMemo(() => {
            return (
                <Fragment>
                    {label}
                    {isIndeterminateValue && (
                        <Box
                            component={'span'}
                            sx={{
                                paddingLeft: 1,
                                color: theme.colors.gray[700],
                            }}
                        >
                            {t('GENERICS.LABELS.MULTI_VALUE')}
                        </Box>
                    )}
                </Fragment>
            );
        }, [isIndeterminateValue, t]);

        return (
            <FormCheckbox
                label={resLabel}
                indeterminate={isIndeterminateValue}
                checked={isIndeterminateValue ? false : Boolean(field.value)}
                data-aid={dataAid}
                role='none'
                //TODO: we need to address these
                labelCompensation={labelCompensation}
                margin={margin}
                {...props}
                {...field}
                disabled={disabled}
                onChange={(event, checked) =>
                    onChange
                        ? onChange(checked)
                        : field.onChange(event, checked)
                }
            />
        );
    };
}
