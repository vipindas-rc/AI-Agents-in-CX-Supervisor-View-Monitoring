import {
    DUPLICATED_IDENTIFIER_ERROR_CODE,
    NO_FOUND_ACTIVITY_ERROR_CODE,
} from './constants';
import type { ContactsInfo } from '../../../common/services/transport';

export const getContactProfileResponse = {
    id: '668e2ea4ddab5700071a1eb9',
    creationTime: '2024-08-21T05:28:41Z',
    lastModifiedTime: '2024-09-01T09:54:18Z',
    attributes: [
        {
            kind: 'Phone',
            label: 'MobilePhones',
            value: '+12055675671',
            isIdentifier: true,
        },
        {
            kind: 'Phone',
            label: 'MobilePhones',
            value: '+12055675672',
            isIdentifier: true,
        },
        {
            kind: 'FirstName',
            value: 'test',
            isIdentifier: false,
        },
        {
            kind: 'LastName',
            value: 'data',
            isIdentifier: false,
        },
        {
            kind: 'Company',
            value: 'RingCentral Inc.',
            isIdentifier: false,
        },
        {
            kind: 'Gender',
            value: 'man',
            isIdentifier: false,
        },
        {
            kind: 'Email',
            label: 'Emails',
            value: 'test.data@ringcentral.com',
            isIdentifier: false,
        },
        {
            kind: 'Phone',
            label: 'HomePhones',
            value: '+5353000000',
            isIdentifier: false,
        },
        {
            kind: 'TagIds',
            value: ['6568c70d699b5600075b7bfd'],
            isIdentifier: false,
        },
    ],
} as ContactsInfo;

export const getContactProfileWithNoFound = {
    isAxiosError: true,
    response: {
        data: {
            errors: [
                {
                    errorCode: 'CJW-105',
                    message: 'Contact not found',
                },
            ],
        },
    },
};

export const errorMessage = 'error message';

export const getContactProfileWithError = {
    isAxiosError: true,
    response: {
        data: {
            errors: [
                {
                    errorCode: 'CJW-106',
                    message: errorMessage,
                },
            ],
        },
    },
};

export const getContactProfileWithActivityError = {
    isAxiosError: true,
    response: {
        data: {
            errors: [
                {
                    errorCode: NO_FOUND_ACTIVITY_ERROR_CODE,
                    message: 'Activity not found',
                },
            ],
        },
    },
};

export const getTagsResponse = [
    {
        id: '6568c70d699b5600075b7bfd',
        created_at: '2023-11-30T17:31:57Z',
        updated_at: '2023-11-30T17:31:57Z',
        name: 'tag1',
    },
    {
        id: '669df029b649ec0007806e6e',
        created_at: '2024-07-22T05:37:45Z',
        updated_at: '2024-07-22T05:37:45Z',
        name: 'tag2',
    },
    {
        id: '66c84c0a840de500073118fb',
        created_at: '2024-08-23T08:44:58Z',
        updated_at: '2024-08-23T08:44:58Z',
        name: 'tag3',
    },
];

export const processedTags = getTagsResponse.map(({ id, name }) => ({
    id,
    label: name,
}));

export const BE_LINKED_NUMBER = '+12055675677';

export const identifierAlreadyLinkedError = {
    isAxiosError: true,
    response: {
        data: {
            errors: [
                {
                    errorCode: DUPLICATED_IDENTIFIER_ERROR_CODE,
                    message: 'identifier_already_linked',
                    already_existing_identifiers: {
                        mobile_phones: [BE_LINKED_NUMBER],
                    },
                },
            ],
        },
    },
};

export const externalData = {
    id: 'test',
    externalId: 'externalId',
    header: 'Header',
    subheader: 'Subheader',
    attributes: [
        {
            kind: 'text',
            label: 'first name',
            value: 'test',
            order: 0,
        },
        {
            kind: 'url',
            label: 'url',
            value: 'www.test.com',
            order: 4,
        },
        {
            kind: 'text',
            label: '',
            value: 'no label test',
            order: 5,
        },
        {
            kind: 'text',
            label: 'last name',
            value: 'name',
            order: 1,
        },
        {
            kind: 'phone',
            label: 'phone number',
            value: '2055675671',
            order: 2,
        },
        {
            kind: 'unSupportedKind',
            label: 'unSupportedKind',
            value: 'unSupportedKind',
            order: 6,
        },
        {
            kind: 'email',
            label: 'email',
            value: 'test@example.com',
            order: 3,
        },
    ],
};
