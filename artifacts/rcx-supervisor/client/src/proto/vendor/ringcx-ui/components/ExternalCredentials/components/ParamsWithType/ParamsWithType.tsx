import type { FC } from 'react';
import { memo, useCallback } from 'react';
import * as React from 'react';

import type { IAccountExtCredential } from '@ringcx/shared';
import type { i18n } from 'i18next';
import type { Control, FieldValues } from 'react-hook-form';
import { useFieldArray } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
    StyledParamsLabel,
    StyledParamsLabelRequired,
} from './ParamsWithType.styled';
import type { UseConfigFormReturn } from '../../../../hooks/useForm';
import { i18next } from '../../../../services/translate';
import type { RHFControllerRenderWithContent } from '../../../../types';
import type { TextInputType } from '../../../Inputs/TextInput';
import { TextInput } from '../../../Inputs/TextInput';
import {
    HeaderText,
    KV,
    StyledKeyValueVariablesList,
    TableHeader,
    TableRow,
} from '../../../VariablesList';
import { Row } from '../../../VariablesList/components';
import { StyledSectionTitle } from '../../styled';
import { AuthInputTypeMapping } from '../../types';

export interface ITypeParams {
    control: UseConfigFormReturn<IAccountExtCredential>['control'];
    name: string;
    title: string;
    i18n?: i18n;
    dataAid?: string;
}

const ParamsWithType: FC<ITypeParams> = ({
    control,
    name,
    title,
    i18n = i18next,
    dataAid,
}) => {
    const { t } = useTranslation(undefined, { i18n });
    const { fields } = useFieldArray<FieldValues, string>({
        control: control as unknown as Control,
        name,
    });
    const data = React.useMemo(
        () => fields.map((field, index) => ({ ...field, index })),
        [fields]
    );

    const columns = [
        {
            id: KV.NAME,
            content: t('VARIABLES_LIST.NAME'),
            render: useCallback(
                ({ field }) => {
                    const index = parseInt(field.name.split('.')?.[1] || '-1');
                    return (
                        <StyledParamsLabel>
                            {field.value}
                            {(fields[index] as Record<string, string>)
                                ?.required ? (
                                <StyledParamsLabelRequired>
                                    *
                                </StyledParamsLabelRequired>
                            ) : (
                                ''
                            )}
                        </StyledParamsLabel>
                    );
                },
                [fields]
            ) as RHFControllerRenderWithContent,
        },
        {
            id: KV.VALUE,
            content: t('VARIABLES_LIST.VALUE'),
            render: useCallback(
                ({ field, fieldState }) => {
                    const error = fieldState.error?.message || '';
                    const index = parseInt(field.name.split('.')?.[1] || '-1');
                    return (
                        <TextInput
                            {...fieldState}
                            {...field}
                            dataAid={field.name}
                            size='small'
                            message={error}
                            error={!!error}
                            value={field.value}
                            required={
                                (fields[index] as Record<string, string>)
                                    ?.required as unknown as boolean
                            }
                            type={
                                ((
                                    AuthInputTypeMapping as Record<
                                        string,
                                        string
                                    >
                                )[
                                    (fields[index] as Record<string, string>)
                                        ?.type
                                ] || 'text') as TextInputType
                            }
                        />
                    );
                },
                [fields]
            ) as RHFControllerRenderWithContent,
        },
    ];
    return (
        <StyledKeyValueVariablesList hideActions={true} data-aid={dataAid}>
            <StyledSectionTitle>{title}</StyledSectionTitle>
            <TableHeader>
                {columns.map(({ id, content }) => (
                    <HeaderText key={id}>{content}</HeaderText>
                ))}
            </TableHeader>
            {data.map((row) => (
                <TableRow key={row.id}>
                    <Row
                        columns={columns}
                        name={name}
                        index={row.index}
                        id={row.id}
                        buttons={[]}
                        {...(control && {
                            control: control as unknown as Control<FieldValues>,
                        })}
                    />
                </TableRow>
            ))}
        </StyledKeyValueVariablesList>
    );
};

export default memo(ParamsWithType);
