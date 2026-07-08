import {
    memo,
    useMemo,
    useState,
    useEffect,
    useRef,
    useCallback,
    Fragment,
} from 'react';
import type { FC } from 'react';

import { EAuthType, type IAccountExtCredential } from '@ringcx/shared';
import { Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
    EFieldControl,
    fieldsSchema,
    fieldsSchemaDependencyFields,
} from './constants';
import { FieldsWrapper } from './ExtCredentialsForm.styled';
import { translateOptions } from './helpers';
import type { IExtCredentialForm, IFormField } from './types';
import { i18next } from '../../../../services/translate';
import CheckBox from '../../../Checkbox/Checkbox';
import { SingleSelect } from '../../../DropDown';
import { FormTextArea } from '../../../FormTextArea';
import { TextInput, TextInputType } from '../../../Inputs/TextInput';
import { isCustomAuthType } from '../../helpers';
import { KeyReader } from '../KeyReader';
import { OtherParams } from '../OtherParams';
import { ParamsWithType } from '../ParamsWithType';

const ExtCredentialsForm: FC<IExtCredentialForm> = ({
    control,
    getValues,
    clearErrors,
    formState,
    isEdit,
    setValue,
    i18n = i18next,
    externalModalFormData,
}) => {
    const { t } = useTranslation(undefined, { i18n });
    const [authType, setAuthType] = useState<EAuthType>(getValues('authType'));
    const [data, setData] = useState<IAccountExtCredential>(getValues());
    const formRef = useRef<HTMLFormElement>(null);
    useEffect(() => {
        const form = formRef.current;
        const firstErrMsg = form?.querySelector('.error-message');
        const field = firstErrMsg?.parentNode;
        if (field) {
            const input =
                field.querySelector('input') || field.querySelector('textarea');
            (field as HTMLElement).scrollIntoView();
            input && input.type !== 'file' && input.focus();
        }
    }, [formState.errors]);

    useEffect(() => {
        isCustomAuthType(authType) &&
            externalModalFormData?.authType?.onChange?.(
                authType,
                getValues,
                setValue
            );
    }, [authType, externalModalFormData]);

    const renderField = useCallback(
        (item: IFormField) => {
            if (item.isVisible?.(data) === false) {
                return null;
            }
            const externalFormItem = externalModalFormData?.[item.name];
            const translationData = translateOptions(item.data || [], t);
            return (
                <Controller
                    key={item.name}
                    name={item.name as keyof IAccountExtCredential}
                    control={control}
                    render={({ field, fieldState }) => {
                        const error = fieldState.error?.message || '';
                        const onChange = (value: string | boolean) => {
                            field.onChange(value);
                            if (item.onChange) {
                                item.onChange(value);
                            }
                        };
                        const fieldNameTooltip = item.fieldNameTooltip
                            ? {
                                  ...item.fieldNameTooltip,
                                  message: t(
                                      `EXTERNAL_CREDENTIALS.${item.fieldNameTooltip?.message}`
                                  ),
                              }
                            : undefined;
                        switch (item.control) {
                            case EFieldControl.select:
                                return (
                                    <SingleSelect
                                        {...fieldState}
                                        {...field}
                                        size='small'
                                        message={error}
                                        error={!!error}
                                        title={t(
                                            `EXTERNAL_CREDENTIALS.${item.title}`
                                        )}
                                        data={{
                                            items:
                                                (externalFormItem?.dataAdditional
                                                    ? translationData.concat(
                                                          externalFormItem?.data ||
                                                              []
                                                      )
                                                    : externalFormItem?.data) ||
                                                translationData,
                                        }}
                                        fieldNameTooltip={fieldNameTooltip}
                                        selectedItemId={field.value}
                                        onChange={onChange}
                                        isSearchable={
                                            externalFormItem?.isSearchable
                                        }
                                        dataAid={item.testAid}
                                        disabled={item.disabled}
                                        useDefaultSort={
                                            item.name !== 'authType' &&
                                            item.name !== 'addTokenTo'
                                        }
                                        required={!!item.required}
                                    />
                                );

                            case EFieldControl.otherParams:
                                return (
                                    <OtherParams
                                        control={control}
                                        i18n={i18n}
                                    />
                                );

                            case EFieldControl.paramsWithType:
                                return (
                                    <ParamsWithType
                                        control={control}
                                        name={item.name}
                                        title={t(
                                            `EXTERNAL_CREDENTIALS.${item.title}`
                                        )}
                                        i18n={i18n}
                                        dataAid={item.testAid}
                                    />
                                );
                            case EFieldControl.text:
                                if (
                                    item.dependentField &&
                                    item.dependentValue &&
                                    item.dependentValue.indexOf(
                                        data[
                                            item.dependentField as keyof IAccountExtCredential
                                        ]
                                    ) === -1
                                ) {
                                    return <Fragment></Fragment>;
                                }
                                return (
                                    <TextInput
                                        {...fieldState}
                                        {...field}
                                        size='small'
                                        message={error}
                                        error={!!error}
                                        title={t(
                                            `EXTERNAL_CREDENTIALS.${item.title}`
                                        )}
                                        fieldNameTooltip={fieldNameTooltip}
                                        value={field.value}
                                        type={item.type as TextInputType}
                                        {...(item.type === TextInputType.NUMBER
                                            ? { min: item.min, max: item.max }
                                            : {})}
                                        onChange={onChange}
                                        required={
                                            typeof item.required === 'string'
                                                ? !!data[
                                                      item.required as keyof IAccountExtCredential
                                                  ]
                                                : item.required
                                        }
                                        dataAid={item.testAid}
                                        disabled={item.disabled}
                                    />
                                );

                            case EFieldControl.textArea:
                                return (
                                    <FormTextArea
                                        {...fieldState}
                                        {...field}
                                        size='small'
                                        message={error}
                                        error={!!error}
                                        title={t(
                                            `EXTERNAL_CREDENTIALS.${item.title}`
                                        )}
                                        fieldNameTooltip={fieldNameTooltip}
                                        value={field.value}
                                        onChange={onChange}
                                        dataAid={item.testAid}
                                        required={!!item.required}
                                    />
                                );

                            case EFieldControl.keyReader:
                                return (
                                    <KeyReader
                                        {...fieldState}
                                        {...field}
                                        errorMessage={error}
                                        title={t(
                                            `EXTERNAL_CREDENTIALS.${item.title}`
                                        )}
                                        maxSizeError={t(
                                            `EXTERNAL_CREDENTIALS.${item.extraTexts?.maxSizeError}`
                                        )}
                                        formatError={t(
                                            `EXTERNAL_CREDENTIALS.${item.extraTexts?.formatError}`
                                        )}
                                        selectFileText={t(
                                            `EXTERNAL_CREDENTIALS.${item.extraTexts?.selectFileText}`
                                        )}
                                        fieldNameTooltip={fieldNameTooltip}
                                        value={field.value}
                                        onChange={onChange}
                                        required={!!item.required}
                                        dataAid={item.testAid}
                                    />
                                );

                            case EFieldControl.checkbox:
                                return (
                                    <CheckBox
                                        label={t(
                                            `EXTERNAL_CREDENTIALS.${item.title}`
                                        )}
                                        checked={
                                            field.value as unknown as boolean
                                        }
                                        onChange={(e, value) => onChange(value)}
                                        dataAid={item.testAid}
                                    />
                                );

                            default:
                                throw new Error('Unknown field control');
                        }
                    }}
                />
            );
        },
        [control, data, t, externalModalFormData]
    );

    const renderFields = useMemo(() => {
        const _authType = isCustomAuthType(authType)
            ? EAuthType.customAuth
            : authType;
        const commonFieldsSchema = fieldsSchema.common;
        commonFieldsSchema.authType = {
            ...commonFieldsSchema.authType,
            disabled: isEdit,
            onChange: (value: EAuthType) => {
                setAuthType(value);
                clearErrors();
            },
        };
        const authFieldsSchema = fieldsSchema[_authType] || {};
        // Add onChange event to fields
        if (fieldsSchemaDependencyFields[_authType]) {
            fieldsSchemaDependencyFields[_authType].forEach((field) => {
                if (authFieldsSchema[field]) {
                    authFieldsSchema[field].onChange = (value: string) => {
                        setData({
                            ...data,
                            [field]: value,
                        } as IAccountExtCredential);
                    };
                }
            });
        }

        return [
            ...Object.values(commonFieldsSchema),
            ...Object.values(authFieldsSchema),
        ].map((item) => renderField(item));
    }, [isEdit, authType, clearErrors, data, renderField]);

    return <FieldsWrapper ref={formRef}>{renderFields}</FieldsWrapper>;
};

export default memo(ExtCredentialsForm);
