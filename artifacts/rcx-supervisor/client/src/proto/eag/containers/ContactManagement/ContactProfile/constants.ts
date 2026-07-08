import type { ProfileFormType } from './types';
import t from '../../../helpers/translate';

export const profileFieldConfigs = [
    {
        key: 'FirstName',
        kind: 'FirstName',
        name: 'FirstName.value',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.FIRST_NAME');
        },
    },
    {
        key: 'LastName',
        kind: 'LastName',
        name: 'LastName.value',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.LAST_NAME');
        },
    },
    {
        key: 'Company',
        kind: 'Company',
        name: 'Company.value',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.COMPANY');
        },
    },
    {
        key: 'Gender',
        kind: 'Gender',
        name: 'Gender.value',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.GENDER');
        },
    },
    {
        key: 'Email',
        kind: 'Email',
        type: 'Emails',
        name: (index: number) => `Email.items.${index}.value`,
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.EMAIL');
        },
        isIdentifier: true,
    },
    {
        key: 'MobilePhones',
        kind: 'Phone',
        type: 'MobilePhones',
        name: (index: number) => `MobilePhones.items.${index}.value`,
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.CELL_PHONE');
        },
        isIdentifier: true,
    },
    {
        key: 'HomePhones',
        kind: 'Phone',
        type: 'HomePhones',
        name: (index: number) => `HomePhones.items.${index}.value`,
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.FIXED_LINE');
        },
        isIdentifier: false,
    },
    {
        key: 'TagIds',
        kind: 'TagIds',
        name: 'TagIds.value',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.TAGS');
        },
    },
    {
        key: 'Notes',
        kind: 'Notes',
        name: 'Notes.value',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.NOTES');
        },
    },
];

export const defaultProfileForm: ProfileFormType = {
    FirstName: {
        key: 'FirstName',
        name: 'First name',
        kind: 'FirstName',
        value: '',
        isIdentifier: false,
    },
    LastName: {
        key: 'LastName',
        name: 'Last name',
        kind: 'LastName',
        value: '',
        isIdentifier: false,
    },
    Company: {
        key: 'Company',
        name: 'Company',
        kind: 'Company',
        value: '',
        isIdentifier: false,
    },
    Gender: {
        key: 'Gender',
        name: 'Gender',
        kind: 'Gender',
        value: '',
        isIdentifier: false,
    },
    Email: {
        key: 'Email',
        name: 'Email',
        items: [
            {
                kind: 'Email',
                value: '',
                label: 'Emails',
                isIdentifier: true,
            },
        ],
    },
    MobilePhones: {
        key: 'MobilePhones',
        name: 'Cell phone',
        items: [
            {
                kind: 'Phone',
                label: 'MobilePhones',
                value: '',
                isIdentifier: true,
            },
        ],
    },
    HomePhones: {
        key: 'HomePhones',
        name: 'Fixed line',
        items: [
            {
                kind: 'Phone',
                label: 'HomePhones',
                value: '',
                isIdentifier: false,
            },
        ],
    },
    TagIds: {
        key: 'TagIds',
        name: 'Tags',
        kind: 'TagIds',
        value: [],
        isIdentifier: false,
    },
    Notes: {
        key: 'Notes',
        name: 'Notes',
        kind: 'Notes',
        value: '',
        isIdentifier: false,
    },
};

export const genderOptions = [
    {
        key: 'none',
        value: '',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.NONE');
        },
    },
    {
        key: 'man',
        value: 'man',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.MALE');
        },
    },
    {
        key: 'woman',
        value: 'woman',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.FEMALE');
        },
    },
];

export const SEARCH_TRANSLATION_KEYS = {
    SEARCH: 'CONTACT_MANAGEMENT.CONTACT_PROFILE.SEARCH',
    SEARCH_BY_CELL_PHONE:
        'CONTACT_MANAGEMENT.CONTACT_PROFILE.SEARCH_BY_CELL_PHONE',
    SEARCH_BY_EMAIL: 'CONTACT_MANAGEMENT.CONTACT_PROFILE.SEARCH_BY_EMAIL',
} as const;

export const identifierOptions = [
    {
        key: 'Phone',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.CELL_PHONE');
        },
    },
    {
        key: 'Email',
        get label() {
            return t('CONTACT_MANAGEMENT.CONTACT_PROFILE.EMAIL');
        },
    },
];

export const NO_FOUND_CONTACT_ERROR_CODE = 'CJW-105';
export const NO_FOUND_ACTIVITY_ERROR_CODE = 'CJW-109';
export const DUPLICATED_IDENTIFIER_ERROR_CODE = 'CJW-114';
export const INVALID_IDENTIFIER_ERROR_CODE = 'CJW-115';

export const MAX_RETRIES = 3;
export const RETRY_DELAY_MS = 3000;

export const editContactTrackSourceMap = {
    FirstName: 'first name',
    LastName: 'last name',
    Company: 'company',
    Gender: 'gender',
    Email: 'email',
    MobilePhones: 'cell phone',
    HomePhones: 'fixed line',
    TagIds: 'tag',
    Notes: 'notes',
};

export const multiContactItems = ['Email', 'Phone'];

export const phoneKindLabels = ['MobilePhones', 'HomePhones'];

export const externalContactSupportedKinds = ['email', 'phone', 'text', 'url'];
export const PHONE = 'Phone';
export const EMAIL = 'Email';
export const SEARCH_BY_CELL_PHONE = 'search by cell phone';
export const SEARCH_BY_EMAIL = 'search by email';
