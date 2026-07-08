import { Fragment, memo, useCallback, useMemo } from 'react';
import type { FC } from 'react';

import type { Control, FieldValues } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { OTHER_PARAMS_DATA_AIDS } from './constants';
import type { IOtherParams } from './types';
import { Trashcan } from '../../../../icons';
import { i18next } from '../../../../services/translate';
import type { RHFControllerRenderWithContent } from '../../../../types';
import { VisuallyHiddenLabel } from '../../../form/VisuallyHiddenLabel';
import { TextInput } from '../../../Inputs/TextInput';
import type { VariableButton } from '../../../VariablesList';
import {
    StyledKeyValueVariablesList,
    VariablesList,
    useKVPairColumns,
} from '../../../VariablesList';
import { StyledSectionTitle } from '../../styled';

const OTHER_PARAMETERS = 'otherParameters';

const OtherParams: FC<IOtherParams> = ({ control, i18n = i18next }) => {
    const { t } = useTranslation(undefined, { i18n });

    const fieldArray = useFieldArray<FieldValues, string>({
        control: control as unknown as Control,
        name: OTHER_PARAMETERS,
    });

    const buttons: VariableButton[] = useMemo(
        () => [
            {
                onClick: (index) => {
                    fieldArray.remove(index);
                },
                icon: <Trashcan />,
                tooltip: t('VARIABLES_LIST.TOOLTIPS.DELETE_VARIABLE'),
            },
        ],
        [fieldArray, t]
    );

    const otherParamsControllerRender: RHFControllerRenderWithContent =
        useCallback(({ content, field, fieldState }) => {
            const error = fieldState.error?.message || '';

            return (
                <Fragment>
                    <VisuallyHiddenLabel htmlFor={field.name}>
                        {content}
                    </VisuallyHiddenLabel>
                    <TextInput
                        {...fieldState}
                        {...field}
                        dataAid={field.name}
                        size='small'
                        message={error}
                        error={!!error}
                        value={field.value}
                    />
                </Fragment>
            );
        }, []);

    const columns = useKVPairColumns(otherParamsControllerRender, i18n);

    return (
        <StyledKeyValueVariablesList>
            <StyledSectionTitle data-aid='external_credentials_other_parameters_label'>
                {t('EXTERNAL_CREDENTIALS.OTHER_PARAMS.TITLE')}
            </StyledSectionTitle>
            <VariablesList
                columns={columns}
                name={OTHER_PARAMETERS}
                buttons={buttons}
                fieldsArray={fieldArray}
                control={control as unknown as Control}
                dataAids={OTHER_PARAMS_DATA_AIDS}
            />
        </StyledKeyValueVariablesList>
    );
};

export default memo(OtherParams);
