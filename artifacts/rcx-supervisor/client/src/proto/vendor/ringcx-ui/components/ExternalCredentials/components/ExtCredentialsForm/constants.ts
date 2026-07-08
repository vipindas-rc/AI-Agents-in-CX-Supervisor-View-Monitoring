import type { IAccountExtCredential } from '@ringcx/shared';
import {
    EAuthType,
    EGrantType,
    EAlgorithmType,
    EClientCredentialsSupplyIn,
    EJWTDestination,
} from '@ringcx/shared';

import type { IFormField } from './types';
import { TextInputType } from '../../../Inputs/TextInput';
import {
    algorithmTypeMenuItems,
    authTypeMenuItems,
    JWTDestMenuItems,
} from '../../constants';

export enum EFieldControl {
    text = 'TextInput',
    textArea = 'TextArea',
    keyReader = 'KeyReader',
    checkbox = 'CheckBox',
    select = 'SingleSelect',
    otherParams = 'OtherParams',
    paramsWithType = 'ParamsWithType',
    authTypeSelect = 'AuthTypeSelect',
}

export const fieldsSchema: Record<string, Record<string, IFormField>> = {
    common: {
        providerName: {
            name: 'providerName',
            required: true,
            control: EFieldControl.text,
            type: 'text',
            title: 'FIELDS.NAME',
            testAid: 'external_credentials_name',
        },
        authType: {
            name: 'authType',
            required: true,
            control: EFieldControl.select,
            title: 'FIELDS.AUTH_TYPE',
            data: authTypeMenuItems,
            testAid: 'external_credentials_auth_type',
        },
        description: {
            name: 'description',
            control: EFieldControl.text,
            type: 'text',
            title: 'FIELDS.DESCRIPTION',
            testAid: 'external_credentials_description',
        },
    },
    [EAuthType.basic]: {
        username: {
            name: 'username',
            required: true,
            control: EFieldControl.text,
            type: 'text',
            title: 'FIELDS.USERNAME',
            testAid: 'external_credentials_username',
        },
        password: {
            name: 'password',
            required: true,
            control: EFieldControl.text,
            type: 'password',
            title: 'FIELDS.PASSWORD',
            testAid: 'external_credentials_password',
        },
    },
    [EAuthType.oauth]: {
        username: {
            name: 'username',
            dependentField: 'grantType',
            dependentValue: [EGrantType.password, EGrantType.clientCredentials],
            control: EFieldControl.text,
            type: 'text',
            title: 'FIELDS.USERNAME',
            testAid: 'external_credentials_username',
        },
        password: {
            name: 'password',
            required: 'username',
            dependentField: 'grantType',
            dependentValue: [EGrantType.password, EGrantType.clientCredentials],
            control: EFieldControl.text,
            type: 'password',
            title: 'FIELDS.PASSWORD',
            testAid: 'external_credentials_password',
        },
        grantType: {
            name: 'grantType',
            control: EFieldControl.select,
            title: 'FIELDS.GRANT_TYPE',
            data: [
                {
                    id: EGrantType.clientCredentials,
                    displayName: 'OPTIONS.CLIENT_CREDENTIALS',
                },
                {
                    id: EGrantType.password,
                    displayName: 'OPTIONS.PASSWORD',
                },
                {
                    id: EGrantType.JWTBearer,
                    displayName: 'OPTIONS.JWT_BEARER',
                },
            ],
            testAid: 'external_credentials_grant_type',
        },
        assertion: {
            name: 'assertion',
            type: 'password',
            required: true,
            dependentField: 'grantType',
            dependentValue: [EGrantType.JWTBearer],
            control: EFieldControl.text,
            title: 'FIELDS.ASSERTION',
            testAid: 'external_credentials_assertion',
        },
        clientId: {
            name: 'clientId',
            required: true,
            control: EFieldControl.text,
            type: 'text',
            title: 'FIELDS.CLIENT_ID',
            testAid: 'external_credentials_client_id',
        },
        secret: {
            name: 'secret',
            required: true,
            control: EFieldControl.text,
            type: 'password',
            title: 'FIELDS.SECRET',
            testAid: 'external_credentials_secret',
        },
        clientCredentialsSupplyIn: {
            name: 'clientCredentialsSupplyIn',
            required: false,
            control: EFieldControl.select,
            title: 'FIELDS.SUPPLY_IN',
            data: [
                {
                    id: EClientCredentialsSupplyIn.body,
                    displayName: 'OPTIONS.BODY',
                },
                {
                    id: EClientCredentialsSupplyIn.queryParam,
                    displayName: 'OPTIONS.QUERY_PARAMS',
                },
                {
                    id: EClientCredentialsSupplyIn.header,
                    displayName: 'OPTIONS.HEADER',
                },
            ],
            testAid: 'external_credentials_supply_in',
        },
        tokenUrl: {
            name: 'tokenUrl',
            required: true,
            control: EFieldControl.text,
            type: 'text',
            title: 'FIELDS.TOKEN_ENDPOINT',
            testAid: 'external_credentials_token_endpoint',
        },
        scope: {
            name: 'scope',
            required: false,
            control: EFieldControl.text,
            type: 'text',
            title: 'FIELDS.SCOPE',
            testAid: 'external_credentials_scope',
        },
        otherParameters: {
            name: 'otherParameters',
            required: false,
            control: EFieldControl.otherParams,
            title: 'OTHER_PARAMS.TITLE',
        },
    },
    [EAuthType.apiKey]: {
        apiKey: {
            name: 'apiKey',
            required: true,
            control: EFieldControl.text,
            type: 'password',
            title: 'FIELDS.API_KEY',
            testAid: 'external_credentials_api_key',
        },
    },
    [EAuthType.jwt]: {
        addTokenTo: {
            name: 'addTokenTo',
            required: true,
            control: EFieldControl.select,
            title: 'FIELDS.ADD_JWT_TOKEN_TO',
            data: JWTDestMenuItems,
            testAid: 'external_credentials_add_token_to',
        },
        algorithm: {
            name: 'algorithm',
            required: true,
            control: EFieldControl.select,
            title: 'FIELDS.ALGORITHM',
            data: algorithmTypeMenuItems,
            testAid: 'external_credentials_algorithm',
            fieldNameTooltip: {
                message: 'TOOLTIPS.ALGORITHM',
            },
        },
        secret: {
            name: 'secret',
            required: true,
            control: EFieldControl.text,
            type: 'password',
            title: 'FIELDS.SECRET',
            testAid: 'external_credentials_secret',
            isVisible: (data: IAccountExtCredential) => {
                return [
                    EAlgorithmType.HS256,
                    EAlgorithmType.HS384,
                    EAlgorithmType.HS512,
                ].includes((data as any).algorithm);
            },
            fieldNameTooltip: {
                message: 'TOOLTIPS.SECRET',
            },
        },
        isSecretEncoded: {
            name: 'isSecretEncoded',
            control: EFieldControl.checkbox,
            title: 'FIELDS.SECRET_BASE64_ENCODED',
            testAid: 'external_credentials_secret_encoded',
            isVisible: (data: IAccountExtCredential) => {
                return [
                    EAlgorithmType.HS256,
                    EAlgorithmType.HS384,
                    EAlgorithmType.HS512,
                ].includes((data as any).algorithm);
            },
        },
        privateKey: {
            name: 'privateKey',
            required: true,
            control: EFieldControl.keyReader,
            title: 'FIELDS.PRIVATE_KEY',
            extraTexts: {
                maxSizeError: 'MESSAGES.MAX_SIZE_EXCEED',
                formatError: 'MESSAGES.INVALID_KEY_FORMAT',
                selectFileText: 'FIELDS.SELECT_UPLOAD_FILE',
            },
            fieldNameTooltip: {
                message: 'TOOLTIPS.PRIVATE_KEY',
            },
            testAid: 'external_credentials_private_key',
            isVisible: (data: IAccountExtCredential) => {
                return ![
                    EAlgorithmType.HS256,
                    EAlgorithmType.HS384,
                    EAlgorithmType.HS512,
                ].includes((data as any).algorithm);
            },
        },
        payload: {
            name: 'payload',
            required: true,
            control: EFieldControl.textArea,
            title: 'FIELDS.PAYLOAD',
            testAid: 'external_credentials_payload',
            fieldNameTooltip: {
                message: 'TOOLTIPS.PAYLOAD',
            },
        },
        headerPrefix: {
            name: 'headerPrefix',
            required: true,
            control: EFieldControl.text,
            title: 'FIELDS.REQUEST_HEADER_PREFIX',
            testAid: 'external_credentials_request_header_prefix',
            isVisible: (data: IAccountExtCredential) => {
                return (
                    (data as any).addTokenTo === EJWTDestination.RequestHeader
                );
            },
            fieldNameTooltip: {
                message: 'TOOLTIPS.REQUEST_HEADER_PREFIX',
                placement: 'top',
            },
        },
        queryParamName: {
            name: 'queryParamName',
            required: true,
            control: EFieldControl.text,
            title: 'FIELDS.QUERY_PARAM_NAME',
            testAid: 'external_credentials_query_param_name',
            isVisible: (data: IAccountExtCredential) => {
                return (data as any).addTokenTo === EJWTDestination.QueryParam;
            },
            fieldNameTooltip: {
                message: 'TOOLTIPS.QUERY_PARAM_NAME',
            },
        },
        jwtHeaders: {
            name: 'jwtHeaders',
            required: false,
            control: EFieldControl.textArea,
            title: 'FIELDS.JWT_HEADERS',
            fieldNameTooltip: {
                message: 'TOOLTIPS.JWT_HEADERS',
            },
            testAid: 'external_credentials_jwtHeaders',
        },
        expirationTime: {
            name: 'expirationTime',
            required: true,
            min: 1,
            max: 24 * 60 * 60,
            control: EFieldControl.text,
            type: TextInputType.NUMBER,
            title: 'FIELDS.EXPIRATION_TIME',
            testAid: 'external_credentials_expiration_time',
            fieldNameTooltip: {
                message: 'TOOLTIPS.EXPIRATION_TIME',
                placement: 'top',
            },
        },
        isIncludeIssueAt: {
            name: 'isIncludeIssueAt',
            control: EFieldControl.checkbox,
            title: 'FIELDS.INCLUDE_ISSUED_AT',
            testAid: 'external_credentials_iat',
        },
    },
    [EAuthType.customAuth]: {
        allowedBaseUrl: {
            name: 'allowedBaseUrl',
            required: true,
            control: EFieldControl.text,
            title: 'FIELDS.ALLOWED_BASE_URL',
            fieldNameTooltip: {
                message: 'TOOLTIPS.ALLOWED_BASE_URL',
            },
            testAid: 'external_credentials_base_url',
        },
        inputParams: {
            name: 'inputParams',
            required: false,
            control: EFieldControl.paramsWithType,
            title: 'FIELDS.CUSTOM_TEMPLATE_PARAMS',
            testAid: 'external_credentials_param_with_type',
        },
    },
};

export const fieldsSchemaDependencyFields: Record<string, string[]> = {
    [EAuthType.basic]: [],
    [EAuthType.oauth]: ['username', 'grantType'],
    [EAuthType.jwt]: ['addTokenTo', 'algorithm'],
};
