import type {
    IAccountExtCredential,
    IAccountExtCredentialsOauth,
    IAccountExtCredentialsBasicUpdate,
    IAccountExtCredentialsOauthUpdate,
    IAccountExtCredentialsBasic,
    IAccountExtCredentialsSave,
    IAccountExtCredentialsApiKey,
    IAccountExtCredentialsApiKeyUpdate,
    IAccountExtCredentialsJWT,
    IAccountExtCredentialsCustomAuth,
    IParamWithType,
} from '@ringcx/shared';
import { EAuthType } from '@ringcx/shared';
import { omit } from 'lodash';

import {
    ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT,
    ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_PRIVATE_KEY,
    ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_TEMPLATE_ID,
    DEFAULT_ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS,
} from '../constants';
import { AuthInputType } from '../types';

export function isExtCredentialTemplate(extCredential: IAccountExtCredential) {
    return extCredential.authConfigId.includes(
        ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_TEMPLATE_ID
    );
}

function clearExtCredentialTemplate(extCredential: IAccountExtCredential) {
    if (isExtCredentialTemplate(extCredential)) {
        return {
            ...extCredential,
            authConfigId:
                DEFAULT_ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS.authConfigId,
        };
    }

    return extCredential;
}

export function getExtCredentialHiddenValues(
    extCredential?: IAccountExtCredential
): IAccountExtCredential {
    if (!extCredential) {
        return DEFAULT_ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS;
    }

    switch (extCredential.authType) {
        case EAuthType.basic:
            return {
                ...extCredential,
                password:
                    (extCredential as IAccountExtCredentialsBasic).password ||
                    ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT,
            };
        case EAuthType.oauth:
            return {
                ...extCredential,
                password: (extCredential as IAccountExtCredentialsOauth)
                    .username
                    ? (extCredential as IAccountExtCredentialsOauth).password ||
                      ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT
                    : '',
                secret:
                    (extCredential as IAccountExtCredentialsOauth).secret ||
                    ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT,
                assertion:
                    (extCredential as IAccountExtCredentialsOauth).assertion ||
                    ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT,
            };
        case EAuthType.apiKey:
            return {
                ...extCredential,
                apiKey:
                    (extCredential as IAccountExtCredentialsApiKey).apiKey ||
                    ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT,
            };
        case EAuthType.jwt: {
            const { algorithm, secret, privateKey } =
                extCredential as IAccountExtCredentialsJWT;
            return algorithm.startsWith('HS')
                ? {
                      ...extCredential,
                      secret:
                          secret ||
                          ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT,
                  }
                : {
                      ...extCredential,
                      privateKey:
                          privateKey ||
                          ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_PRIVATE_KEY,
                  };
        }
        case EAuthType.customAuth: {
            const { authType, inputParams, ...rest } = (extCredential ||
                {}) as IAccountExtCredentialsCustomAuth;
            return {
                ...rest,
                authType: rest.wcgFunctionId as EAuthType,
                inputParams: inputParams?.map((t) => {
                    return {
                        ...t,
                        value:
                            t.type === AuthInputType.secret && t.value === null
                                ? ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT
                                : t.value,
                    };
                }),
            };
        }
        default:
            return extCredential;
    }
}

function clearExtCredentialHiddenValues(
    extCredential: IAccountExtCredential
):
    | IAccountExtCredentialsBasicUpdate
    | IAccountExtCredentialsOauthUpdate
    | IAccountExtCredentialsApiKeyUpdate {
    const extCredentialCleaned:
        | IAccountExtCredentialsBasicUpdate
        | IAccountExtCredentialsOauthUpdate
        | IAccountExtCredentialsApiKeyUpdate = extCredential;

    if (
        (
            extCredential as
                | IAccountExtCredentialsBasicUpdate
                | IAccountExtCredentialsOauthUpdate
        ).password === ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT
    ) {
        delete (extCredential as IAccountExtCredentialsBasicUpdate).password;
    }

    if (
        (extCredential as IAccountExtCredentialsOauth).secret ===
        ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT
    ) {
        delete (extCredential as IAccountExtCredentialsOauthUpdate).secret;
    }

    if (
        (extCredential as IAccountExtCredentialsApiKey).apiKey ===
        ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT
    ) {
        delete (extCredential as IAccountExtCredentialsApiKeyUpdate).apiKey;
    }

    if (
        (extCredential as IAccountExtCredentialsJWT).privateKey ===
        ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_PRIVATE_KEY
    ) {
        delete (extCredential as IAccountExtCredentialsJWT).privateKey;
    }

    if (
        (extCredential as IAccountExtCredentialsOauth).assertion ===
        ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT
    ) {
        delete (extCredential as IAccountExtCredentialsOauthUpdate).assertion;
    }
    if ((extCredential as IAccountExtCredentialsCustomAuth).inputParams) {
        (extCredential as IAccountExtCredentialsCustomAuth).inputParams = (
            extCredential as IAccountExtCredentialsCustomAuth
        ).inputParams?.map(
            (t) =>
                ({
                    ...t,
                    value:
                        t.value === undefined
                            ? ''
                            : t.value ===
                                ACCOUNT_CONFIG_EXTERNAL_CREDENTIALS_HIDDEN_TEXT
                              ? null
                              : t.value?.replace(/\s+/g, ''),
                }) as IParamWithType
        );
    }

    return extCredentialCleaned;
}

function clearExtCredentialFields(
    extCredentials: IAccountExtCredential
): IAccountExtCredential {
    const jwtFields = [
        'addTokenTo',
        'algorithm',
        'isSecretEncoded',
        'privateKey',
        'payload',
        'headerPrefix',
        'queryParamName',
        'jwtHeaders',
        'expirationTime',
        'isIncludeIssueAt',
    ];
    const oauthFields = [
        'username',
        'password',
        'grantType',
        'clientId',
        'clientCredentialsSupplyIn',
        'tokenUrl',
        'scope',
        'otherParameters',
    ];
    if (extCredentials.authType === EAuthType.basic) {
        return omit(extCredentials, [
            'grantType',
            'clientId',
            'secret',
            'clientCredentialsSupplyIn',
            'tokenUrl',
            'scope',
            'otherParameters',
            'apiKey',
            ...jwtFields,
        ]) as IAccountExtCredentialsBasic;
    } else if (extCredentials.authType === EAuthType.oauth) {
        return omit(extCredentials, [
            'apiKey',
            ...jwtFields,
        ]) as IAccountExtCredentialsOauth;
    } else if (extCredentials.authType === EAuthType.apiKey) {
        return omit(extCredentials, [
            'secret',
            ...oauthFields,
            ...jwtFields,
        ]) as IAccountExtCredentialsApiKey;
    } else if (extCredentials.authType === EAuthType.jwt) {
        return omit(extCredentials, [
            'apiKey',
            ...oauthFields,
        ]) as IAccountExtCredentialsJWT;
    } else {
        return omit(extCredentials, [
            'apiKey',
            'secret',
            ...oauthFields,
            ...jwtFields,
        ]) as IAccountExtCredentialsCustomAuth;
    }
}

export function clearExtCredential(
    extCredentials: IAccountExtCredential
): IAccountExtCredentialsSave {
    // get rid of temporary authConfigId
    const extCredentialsWithCleanedId =
        clearExtCredentialTemplate(extCredentials);

    // get fid of unnecessary form fields
    const extCredentialsWithCleanedFields = clearExtCredentialFields(
        extCredentialsWithCleanedId
    );

    // get rid of temporary fake password and secret values
    return clearExtCredentialHiddenValues(extCredentialsWithCleanedFields);
}

export function isValidKeyFormat(content: string) {
    const trimedContent = content.trim();
    return (
        (trimedContent.startsWith('-----BEGIN ENCRYPTED PRIVATE KEY-----') &&
            trimedContent.endsWith('-----END ENCRYPTED KEY-----')) ||
        (trimedContent.startsWith('-----BEGIN RSA PRIVATE KEY-----') &&
            trimedContent.endsWith('-----END RSA PRIVATE KEY-----')) ||
        (trimedContent.startsWith('-----BEGIN PRIVATE KEY-----') &&
            trimedContent.endsWith('-----END PRIVATE KEY-----'))
    );
}

export function isValidJSONFormat(jsonString?: string) {
    const value = jsonString?.trim();
    if (!value) {
        return true;
    }
    try {
        const result = JSON.parse(value);
        return typeof result === 'object' && result !== null;
    } catch (e) {
        return false;
    }
}

// We use function id as authType to match function's name when using
// Only change to auth type when query API
export function isCustomAuthType(authType: EAuthType) {
    return (
        authType !== EAuthType.basic &&
        authType !== EAuthType.oauth &&
        authType !== EAuthType.apiKey &&
        authType !== EAuthType.jwt
    );
}
