import type { IAccountExtCredential } from '@ringcx/shared';
import {
    EAuthType,
    EGrantType,
    EClientCredentialsSupplyIn,
    EAlgorithmType,
    EJWTDestination,
} from '@ringcx/shared';

import type { IMenuItem } from '../DropDown';

export const ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_TEMPLATE_ID = 'temporary-id';

export const ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT = '********';

export const ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_PRIVATE_KEY = `-----BEGIN PRIVATE KEY-----
ZmFrZSBwcml2YXRlIGtleQ==
-----END PRIVATE KEY-----`;

export const DEFAULT_ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS: IAccountExtCredential =
    {
        authConfigId: '',
        providerName: '',
        description: '',
        authType: EAuthType.basic,
        username: '',
        password: '',
        createdTime: '',
        updatedTime: '',
        grantType: EGrantType.clientCredentials,
        clientId: '',
        secret: '',
        clientCredentialsSupplyIn: EClientCredentialsSupplyIn.body,
        tokenUrl: '',
        scope: '',
        otherParameters: [],
        addTokenTo: EJWTDestination.RequestHeader,
        algorithm: EAlgorithmType.HS256,
        isSecretEncoded: false,
        privateKey: '',
        payload: '{}',
        queryParamName: 'token',
        headerPrefix: 'Bearer',
        jwtHeaders: '{}',
        expirationTime: 600,
        isIncludeIssueAt: false,
    };

export const authTypeMenuItems: IMenuItem[] = [
    {
        id: EAuthType.basic,
        displayName: 'OPTIONS.BASIC',
    },
    {
        id: EAuthType.oauth,
        displayName: 'OPTIONS.OAUTH',
    },
    {
        id: EAuthType.apiKey,
        displayName: 'OPTIONS.API_KEY',
    },
    {
        id: EAuthType.jwt,
        displayName: 'OPTIONS.JWT',
    },
];

export const algorithmTypeMenuItems: IMenuItem[] = [
    {
        id: EAlgorithmType.HS256,
        displayName: 'ALGORITHMS.HS256',
    },
    {
        id: EAlgorithmType.HS384,
        displayName: 'ALGORITHMS.HS384',
    },
    {
        id: EAlgorithmType.HS512,
        displayName: 'ALGORITHMS.HS512',
    },

    {
        id: EAlgorithmType.RS256,
        displayName: 'ALGORITHMS.RS256',
    },
    {
        id: EAlgorithmType.RS384,
        displayName: 'ALGORITHMS.RS384',
    },
    {
        id: EAlgorithmType.RS512,
        displayName: 'ALGORITHMS.RS512',
    },

    // {
    //     id: EAlgorithmType.PS256,
    //     displayName: 'ALGORITHMS.PS256',
    // },
    // {
    //     id: EAlgorithmType.PS384,
    //     displayName: 'ALGORITHMS.PS384',
    // },
    // {
    //     id: EAlgorithmType.PS512,
    //     displayName: 'ALGORITHMS.PS512',
    // },

    // {
    //     id: EAlgorithmType.ES256,
    //     displayName: 'ALGORITHMS.ES256',
    // },
    // {
    //     id: EAlgorithmType.ES384,
    //     displayName: 'ALGORITHMS.ES384',
    // },
    // {
    //     id: EAlgorithmType.ES512,
    //     displayName: 'ALGORITHMS.ES512',
    // },
];

export const JWTDestMenuItems: IMenuItem[] = [
    {
        id: EJWTDestination.RequestHeader,
        displayName: 'DESTINATION.REQUEST_HEADER',
    },
    {
        id: EJWTDestination.QueryParam,
        displayName: 'DESTINATION.QUERY_PARAM',
    },
];

export const EXTERNAL_CREDENTIALS_SPINNER = 'external-credentials-spinner';
