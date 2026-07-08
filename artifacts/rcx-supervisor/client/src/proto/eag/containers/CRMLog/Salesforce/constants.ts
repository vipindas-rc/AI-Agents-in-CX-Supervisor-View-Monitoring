import AccountIcon from './icons/account.png';
import CaseIcon from './icons/case.png';
import ContactIcon from './icons/contact.png';
import CustomIcon from './icons/custom.png';
import LeadIcon from './icons/lead.png';
import OpportunityIcon from './icons/opportunity.png';

export enum SFRecordType {
    Contact = 'Contact',
    Account = 'Account',
    Case = 'Case',
    Lead = 'Lead',
    Opportunity = 'Opportunity',
    Custom = 'Custom',
}

export const SF_ICON_MAP: Record<string, string> = {
    [SFRecordType.Contact]: ContactIcon,
    [SFRecordType.Lead]: LeadIcon,
    [SFRecordType.Account]: AccountIcon,
    [SFRecordType.Opportunity]: OpportunityIcon,
    [SFRecordType.Case]: CaseIcon,
    [SFRecordType.Custom]: CustomIcon,
};

export const SF_NAME_FIELD_OBJ = [
    {
        type: SFRecordType.Contact,
        labelTranslateKey: 'CRM.SALESFORCE.FIELD.CONTACT',
    },
    {
        type: SFRecordType.Lead,
        labelTranslateKey: 'CRM.SALESFORCE.FIELD.LEAD',
    },
];

export const SF_RELATED_FIELD_OBJ = [
    {
        type: SFRecordType.Account,
        labelTranslateKey: 'CRM.SALESFORCE.FIELD.ACCOUNT',
    },
    {
        type: SFRecordType.Opportunity,
        labelTranslateKey: 'CRM.SALESFORCE.FIELD.OPPORTUNITY',
    },
    {
        type: SFRecordType.Case,
        labelTranslateKey: 'CRM.SALESFORCE.FIELD.CASE',
    },
];

export const SF_NAME_FIELD = ['Contact', 'Lead'];
