import { useCallback, useMemo, useState } from 'react';
import * as React from 'react';

import {
    EAlgorithmType,
    EAuthType,
    EGrantType,
    EJWTDestination,
    type IAccountExtCredential,
    isValidPatternUrl,
} from '@ringcx/shared';
import { useTranslation } from 'react-i18next';
import * as Yup from 'yup';

import type { UseExtCredentialSaveModal } from './types';
import { useConfigForm } from '../../../hooks/useForm';
import { i18next } from '../../../services/translate';
import { Button } from '../../Button';
import Spinner from '../../Spinner';
import { ExtCredentialsForm } from '../components/ExtCredentialsForm';
import { SpinnerWrapper } from '../components/ExtCredentialsForm/ExtCredentialsForm.styled';
import {
    DEFAULT_ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS,
    EXTERNAL_CREDENTIALS_SPINNER,
} from '../constants';
import {
    getExtCredentialHiddenValues,
    isCustomAuthType,
    isValidJSONFormat,
    isValidKeyFormat,
} from '../helpers';
import { StyledDialog } from '../styled';

export const useSaveExtCredentialModal: UseExtCredentialSaveModal = ({
    onSubmit,
    i18n = i18next,
    loading = false,
    externalModalFormData,
    openHook,
}) => {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation(undefined, { i18n });

    // todo: get validation scheme from data models
    const validationScheme = useMemo(() => {
        const expirationTimeRange = t(
            'EXTERNAL_CREDENTIALS.MESSAGES.EXPIRATION_TIME_RANGE'
        );
        const privateKeyFormat = t(
            'EXTERNAL_CREDENTIALS.MESSAGES.INVALID_KEY_FORMAT'
        );
        const JSONFormat = t(
            'EXTERNAL_CREDENTIALS.MESSAGES.INVALID_JSON_FORMAT'
        );
        const baseUrlFormat = t(
            'EXTERNAL_CREDENTIALS.MESSAGES.INVALID_BASE_URL_FORMAT'
        );
        const requiredMessage = t('EXTERNAL_CREDENTIALS.VALIDATIONS.REQUIRED');

        return Yup.object({
            authConfigId: Yup.string(),
            authType: Yup.string(),
            providerName: Yup.string().required(() => requiredMessage),
            username: Yup.string().when('authType', {
                is: EAuthType.basic,
                then: (schema) => schema.required(requiredMessage),
            }),
            password: Yup.string().when(['authType', 'username', 'grantType'], {
                // If only check auth and username has value, will stop save when set username then change authtype
                is: (
                    authType: string,
                    username: string,
                    grantType: EGrantType
                ) =>
                    authType === EAuthType.basic ||
                    (authType === EAuthType.oauth &&
                        [
                            EGrantType.clientCredentials,
                            EGrantType.password,
                        ].includes(grantType) &&
                        username),
                then: (schema) => schema.required(requiredMessage),
            }),
            grantType: Yup.string().when('authType', {
                is: EAuthType.oauth,
                then: (schema) => schema.required(requiredMessage),
            }),
            assertion: Yup.string().when(['authType', 'grantType'], {
                is: (authType: string, grantType: EGrantType) =>
                    authType === EAuthType.oauth &&
                    grantType === EGrantType.JWTBearer,
                then: (schema) => schema.required(requiredMessage),
            }),
            clientId: Yup.string().when('authType', {
                is: EAuthType.oauth,
                then: (schema) => schema.required(requiredMessage),
            }),
            secret: Yup.string().when(['authType', 'algorithm'], {
                is: (authType: string, algorithm: EAlgorithmType) => {
                    if (authType === EAuthType.oauth) {
                        return true;
                    }
                    return (
                        authType === EAuthType.jwt &&
                        [
                            EAlgorithmType.HS256,
                            EAlgorithmType.HS384,
                            EAlgorithmType.HS512,
                        ].includes(algorithm)
                    );
                },
                then: (schema) => schema.required(requiredMessage),
            }),
            tokenUrl: Yup.string()
                .transform((value) => value?.replace(/\s/g, ''))
                .when('authType', {
                    is: EAuthType.oauth,
                    then: (schema) => schema.required(requiredMessage),
                }),
            apiKey: Yup.string().when('authType', {
                is: EAuthType.apiKey,
                then: (schema) => schema.required(requiredMessage),
            }),
            payload: Yup.string().when('authType', {
                is: EAuthType.jwt,
                then: (schema) =>
                    schema
                        .required(requiredMessage)
                        .test(
                            'isValidJSONFormat',
                            JSONFormat,
                            isValidJSONFormat
                        ),
            }),
            privateKey: Yup.string().when(['authType', 'algorithm'], {
                is: (authType: string, algorithm: EAlgorithmType) =>
                    authType === EAuthType.jwt &&
                    ![
                        EAlgorithmType.HS256,
                        EAlgorithmType.HS384,
                        EAlgorithmType.HS512,
                    ].includes(algorithm),
                then: (schema) =>
                    schema
                        .required(requiredMessage)
                        .test(
                            'is-valid-private-key',
                            privateKeyFormat,
                            (value) => {
                                return isValidKeyFormat(value);
                            }
                        ),
            }),
            headerPrefix: Yup.string().when('addTokenTo', {
                is: EJWTDestination.RequestHeader,
                then: (schema) => schema.required(requiredMessage),
            }),
            jwtHeaders: Yup.string().when('authType', {
                is: EAuthType.jwt,
                then: (schema) =>
                    schema.test(
                        'isValidJSONFormat',
                        JSONFormat,
                        isValidJSONFormat
                    ),
            }),
            queryParamName: Yup.string().when('addTokenTo', {
                is: EJWTDestination.QueryParam,
                then: (schema) => schema.required(requiredMessage),
            }),
            expirationTime: Yup.number().when('authType', {
                is: EAuthType.jwt,
                then: (schema) =>
                    schema
                        .transform((value, originalValue) => {
                            return originalValue === '' ? undefined : value;
                        })
                        .required(requiredMessage)
                        .typeError(expirationTimeRange)
                        .max(24 * 60 * 60, expirationTimeRange)
                        .min(1, expirationTimeRange),
            }),
            allowedBaseUrl: Yup.string().when('authType', {
                is: (authType: EAuthType) => {
                    return isCustomAuthType(authType);
                },
                then: (schema) =>
                    schema
                        .required(requiredMessage)
                        .test(
                            'isValidPatternUrl',
                            baseUrlFormat,
                            isValidPatternUrl
                        ),
            }),
            inputParams: Yup.array().of(
                Yup.object({
                    required: Yup.boolean(),
                    value: Yup.string().when('required', {
                        is: true,
                        then: (schema) => schema.required(requiredMessage),
                        otherwise: (schema) => schema.notRequired(),
                    }),
                })
            ),
        });
    }, [t]);

    const {
        control,
        handleSubmit,
        reset,
        getValues,
        clearErrors,
        formState,
        setValue,
    } = useConfigForm<IAccountExtCredential>({
        validationScheme,
        defaultValues: DEFAULT_ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS,
    });

    const showSaveModal = useCallback(
        async (extCredential?: IAccountExtCredential) => {
            reset(getExtCredentialHiddenValues(extCredential));
            setOpen(true);
            await openHook?.();
        },
        [reset]
    );

    const onCloseModal = useCallback(() => {
        setOpen(false);
    }, []);

    const onSubmitModal = useCallback(
        () =>
            handleSubmit((values) => {
                onSubmit(values);
                onCloseModal();
            }),
        [handleSubmit, onCloseModal, onSubmit]
    );

    const renderSaveModal = useMemo(() => {
        const options = {
            // TODO: should be fixed in the scope EVAA-16489
            style: { zIndex: 1450 },
            disableBackdropClick: true,
            maxPaperWidth: 500,
            scrollable: true,
            dialogTitle: getValues('authConfigId')
                ? t('EXTERNAL_CREDENTIALS.EDIT')
                : t('EXTERNAL_CREDENTIALS.NEW'),
            content: (
                <React.Fragment>
                    {loading ? (
                        <SpinnerWrapper data-aid={EXTERNAL_CREDENTIALS_SPINNER}>
                            <Spinner />
                        </SpinnerWrapper>
                    ) : null}
                    <ExtCredentialsForm
                        {...{
                            control,
                            getValues,
                            clearErrors,
                            formState,
                            setValue,
                            isEdit: !!getValues('authConfigId'),
                            externalModalFormData,
                        }}
                    />
                </React.Fragment>
            ),
            actions: [
                <Button
                    key='cancel'
                    variant='text'
                    onClick={onCloseModal}
                    data-aid={'external_credentials_cancel'}
                >
                    {t('EXTERNAL_CREDENTIALS.CANCEL')}
                </Button>,
                <Button
                    key='continue'
                    onClick={onSubmitModal()}
                    data-aid={'external_credentials_continue'}
                >
                    {t('EXTERNAL_CREDENTIALS.SAVE')}
                </Button>,
            ],
            open,
            onClose: onCloseModal,
        };

        return <StyledDialog {...options} />;
    }, [
        getValues,
        t,
        control,
        clearErrors,
        formState,
        setValue,
        onCloseModal,
        onSubmitModal,
        open,
    ]);

    return { renderSaveModal, showSaveModal };
};
