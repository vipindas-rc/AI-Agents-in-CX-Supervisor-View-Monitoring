import { CRMPlatform } from '../../../constants/crm';
import {
    DN_ICON_MAP,
    DN_NAME_FIELD,
    DN_NAME_FIELD_OBJ,
    DN_RELATED_FIELD,
    DN_RELATED_FIELD_OBJ,
} from '../Dynamics365/constants';
import {
    SF_NAME_FIELD_OBJ,
    SF_RELATED_FIELD_OBJ,
    SF_NAME_FIELD,
    SF_ICON_MAP,
} from '../Salesforce/constants';
import {
    SN_NAME_FIELD_OBJ,
    SN_RELATED_FIELD_OBJ,
    SN_NAME_FIELD,
    SN_RELATED_FIELD,
    SN_ICON_MAP,
    SnCallLoggingType,
} from '../ServiceNow/constants';
import {
    ZH_NAME_FIELD_OBJ,
    ZH_RELATED_FIELD_OBJ,
    ZH_NAME_FIELD,
    ZH_RELATED_FIELD,
    ZH_ICON_MAP,
} from '../Zoho/constants';

export const NAME_FIELD_OBJ = {
    [CRMPlatform.ServiceNow]: SN_NAME_FIELD_OBJ[SnCallLoggingType.INTERACTION],
    [CRMPlatform.Salesforce]: SF_NAME_FIELD_OBJ,
    [CRMPlatform.Zoho]: ZH_NAME_FIELD_OBJ,
    [CRMPlatform.Dynamics365]: DN_NAME_FIELD_OBJ,
};

export const RELATED_FIELD_OBJ = {
    [CRMPlatform.ServiceNow]:
        SN_RELATED_FIELD_OBJ[SnCallLoggingType.INTERACTION],
    [CRMPlatform.Salesforce]: SF_RELATED_FIELD_OBJ,
    [CRMPlatform.Zoho]: ZH_RELATED_FIELD_OBJ,
    [CRMPlatform.Dynamics365]: DN_RELATED_FIELD_OBJ,
};

export const NAME_FIELD = {
    [CRMPlatform.ServiceNow]: SN_NAME_FIELD[SnCallLoggingType.INTERACTION],
    [CRMPlatform.Salesforce]: SF_NAME_FIELD,
    [CRMPlatform.Zoho]: ZH_NAME_FIELD,
    [CRMPlatform.Dynamics365]: DN_NAME_FIELD,
};

export const RELATED_FIELD = {
    [CRMPlatform.ServiceNow]: SN_RELATED_FIELD[SnCallLoggingType.INTERACTION],
    [CRMPlatform.Salesforce]: SF_NAME_FIELD, // by exclude name field
    [CRMPlatform.Zoho]: ZH_RELATED_FIELD,
    [CRMPlatform.Dynamics365]: DN_RELATED_FIELD,
};

export const ICON_MAP = {
    [CRMPlatform.ServiceNow]: SN_ICON_MAP,
    [CRMPlatform.Salesforce]: SF_ICON_MAP,
    [CRMPlatform.Zoho]: ZH_ICON_MAP,
    [CRMPlatform.Dynamics365]: DN_ICON_MAP,
};

export const LOG_INFO_KEY = {
    [CRMPlatform.ServiceNow]: 'serviceNowLogInfo',
    [CRMPlatform.Salesforce]: 'salesforceLogInfo',
    [CRMPlatform.Zoho]: 'zohoLogInfo',
    [CRMPlatform.Dynamics365]: 'dynamicsLogInfo',
};
