import { NAME_FIELD, RELATED_FIELD } from './constants';
import type { CommonCRMPlatform } from './types';
import { MatchType } from './types';
import type { MatchItem } from '../../../components/CRM/types';
import { CRMPlatform } from '../../../constants/crm';
import {
    SN_NAME_FIELD,
    SN_RELATED_FIELD,
    SnCallLoggingType,
} from '../ServiceNow/constants';

export const getMatchedItems = (
    matchType: MatchType,
    matchedRecord: MatchItem[],
    platform: CommonCRMPlatform,
    isIncidentLogging: boolean
) => {
    let matchedField =
        matchType === MatchType.NAME
            ? NAME_FIELD[platform]
            : RELATED_FIELD[platform];

    if (isIncidentLogging && platform === CRMPlatform.ServiceNow) {
        matchedField = MatchType.NAME
            ? SN_NAME_FIELD[SnCallLoggingType.INCIDENT]
            : SN_RELATED_FIELD[SnCallLoggingType.INCIDENT];
    }

    if (
        platform === CRMPlatform.Salesforce &&
        matchType === MatchType.RELATED
    ) {
        return matchedRecord.filter(
            (item) => !!item.type && !matchedField.includes(item.type)
        );
    }

    return matchedRecord.filter(
        (item) => !!item.type && matchedField.includes(item.type)
    );
};
