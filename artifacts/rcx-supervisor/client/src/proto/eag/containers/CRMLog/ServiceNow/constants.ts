import { ReactComponent as AccountIcon } from './icons/icon_account.svg';
import { ReactComponent as CaseIcon } from './icons/icon_case.svg';
import { ReactComponent as CaseTaskIcon } from './icons/icon_case_task.svg';
import { ReactComponent as ConsumerIcon } from './icons/icon_consumer.svg';
import { ReactComponent as ContactIcon } from './icons/icon_contact.svg';
import { ReactComponent as UserIcon } from './icons/icon_user.svg';

export enum SnCallLoggingType {
    INTERACTION = 'INTERACTION',
    INCIDENT = 'INCIDENT',
}

export enum SNRecordType {
    Account = 'Account',
    CaseTask = 'CaseTask',
    Case = 'Case',
    Consumer = 'Consumer',
    Contact = 'Contact',
    User = 'User',
}

export const SN_ICON_MAP: Record<string, React.FunctionComponent> = {
    [SNRecordType.Contact]: ContactIcon,
    [SNRecordType.Consumer]: ConsumerIcon,
    [SNRecordType.Account]: AccountIcon,
    [SNRecordType.CaseTask]: CaseTaskIcon,
    [SNRecordType.Case]: CaseIcon,
    [SNRecordType.User]: UserIcon,
};

const SN_NAME_FIELD_OBJ_FOR_INTEGRATION = [
    {
        type: SNRecordType.Account,
        labelTranslateKey: 'CRM.SERVICENOW.FIELD.ACCOUNT',
    },
    {
        type: SNRecordType.Contact,
        labelTranslateKey: 'CRM.SERVICENOW.FIELD.CONTACT',
    },
    {
        type: SNRecordType.Consumer,
        labelTranslateKey: 'CRM.SERVICENOW.FIELD.CONSUMER',
    },
];

const SN_NAME_FIELD_OBJ_FOR_INCIDENT = [
    {
        type: SNRecordType.Contact,
        labelTranslateKey: 'CRM.SERVICENOW.FIELD.CONTACT',
        excludeFromCreateMenu: true,
    },
    {
        type: SNRecordType.User,
        labelTranslateKey: 'CRM.SERVICENOW.FIELD.USER',
        excludeFromCreateMenu: true,
    },
];

const SN_RELATED_FIELD_OBJ_FOR_INTEGRATION = [
    {
        type: SNRecordType.Case,
        labelTranslateKey: 'CRM.SERVICENOW.FIELD.CASE',
    },
    {
        type: SNRecordType.CaseTask,
        labelTranslateKey: 'CRM.SERVICENOW.FIELD.CASE_TASK',
    },
];
export const SN_NAME_FIELD_OBJ = {
    [SnCallLoggingType.INTERACTION]: SN_NAME_FIELD_OBJ_FOR_INTEGRATION,
    [SnCallLoggingType.INCIDENT]: SN_NAME_FIELD_OBJ_FOR_INCIDENT,
};

export const SN_RELATED_FIELD_OBJ = {
    [SnCallLoggingType.INTERACTION]: SN_RELATED_FIELD_OBJ_FOR_INTEGRATION,
    [SnCallLoggingType.INCIDENT]: [],
};

export const SN_NAME_FIELD = {
    [SnCallLoggingType.INTERACTION]: ['Account', 'Contact', 'Consumer'],
    [SnCallLoggingType.INCIDENT]: ['Contact', 'User'],
};

export const SN_RELATED_FIELD = {
    [SnCallLoggingType.INTERACTION]: ['Case', 'CaseTask'],
    [SnCallLoggingType.INCIDENT]: [],
};
