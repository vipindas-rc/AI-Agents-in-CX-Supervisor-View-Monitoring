import { ReactComponent as AccountIcon } from './icons/zoho_account.svg';
import { ReactComponent as CampaignIcon } from './icons/zoho_campaign.svg';
import { ReactComponent as ContactIcon } from './icons/zoho_contact.svg';
import { ReactComponent as DealIcon } from './icons/zoho_deal.svg';
import { ReactComponent as LeadIcon } from './icons/zoho_lead.svg';

export const recordSearchType = 'Search';

export const ZH_ICON_MAP: Record<string, React.FunctionComponent> = {
    Contact: ContactIcon,
    Lead: LeadIcon,
    Account: AccountIcon,
    Deal: DealIcon,
    Campaign: CampaignIcon,
};

export enum RecordType {
    Account = 'Account',
    Campaign = 'Campaign',
    Contact = 'Contact',
    Deal = 'Deal',
    Lead = 'Lead',
}

export const ZH_NAME_FIELD_OBJ = [
    {
        type: RecordType.Contact,
        labelTranslateKey: 'CRM.ZOHO.FIELD.CONTACT',
    },
    {
        type: RecordType.Lead,
        labelTranslateKey: 'CRM.ZOHO.FIELD.LEAD',
    },
];

export const ZH_RELATED_FIELD_OBJ = [
    {
        type: RecordType.Account,
        labelTranslateKey: 'CRM.ZOHO.FIELD.ACCOUNT',
    },
    {
        type: RecordType.Campaign,
        labelTranslateKey: 'CRM.ZOHO.FIELD.CAMPAIGN',
    },
    {
        type: RecordType.Deal,
        labelTranslateKey: 'CRM.ZOHO.FIELD.DEAL',
    },
];

export const ZH_NAME_FIELD = ['Contact', 'Lead'];

export const ZH_RELATED_FIELD = ['Account', 'Campaign', 'Deal'];
