import { ReactComponent as AccountIcon } from './icons/account.svg';
import { ReactComponent as CaseIcon } from './icons/case.svg';
import { ReactComponent as ContactIcon } from './icons/contact.svg';
import { ReactComponent as LeadIcon } from './icons/lead.svg';
import { ReactComponent as OpportunityIcon } from './icons/opportunity.svg';

export enum DNRecordType {
    Account = 'Account',
    Contact = 'Contact',
    Lead = 'Lead',
    Opportunity = 'Opportunity',
    Case = 'Case',
}

export const DN_ICON_MAP: Record<string, React.FunctionComponent> = {
    [DNRecordType.Account]: AccountIcon,
    [DNRecordType.Contact]: ContactIcon,
    [DNRecordType.Lead]: LeadIcon,
    [DNRecordType.Opportunity]: OpportunityIcon,
    [DNRecordType.Case]: CaseIcon,
};

export const DN_NAME_FIELD_OBJ = [
    {
        type: 'Account',
        labelTranslateKey: 'CRM.DYNAMICS365.FIELD.ACCOUNT',
    },
    {
        type: 'Contact',
        labelTranslateKey: 'CRM.DYNAMICS365.FIELD.CONTACT',
    },
    {
        type: 'Lead',
        labelTranslateKey: 'CRM.DYNAMICS365.FIELD.LEAD',
    },
];

export const DN_RELATED_FIELD_OBJ = [
    ...DN_NAME_FIELD_OBJ,
    {
        type: 'Opportunity',
        labelTranslateKey: 'CRM.DYNAMICS365.FIELD.OPPORTUNITY',
    },
    {
        type: 'Case',
        labelTranslateKey: 'CRM.DYNAMICS365.FIELD.CASE',
    },
];

export const DN_NAME_FIELD = ['Account', 'Contact', 'Lead'];

export const DN_RELATED_FIELD = ['Opportunity', 'Case'];

export const ALL_FIELD = [...DN_NAME_FIELD, ...DN_RELATED_FIELD];
