import { useEffect, useState } from 'react';

import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import { useMatchRecords } from '../../../../components/CRM/Hooks/useMatchRecords';
import type { MatchItem } from '../../../../components/CRM/types';
import { ParamsType } from '../../../../constants/crm';
import { SnCallLoggingType } from '../../ServiceNow/constants';
import type { CommonCRMPlatform } from '../types';
import { MatchType } from '../types';
import { getMatchedItems } from '../utils';

export function useCommonMatchRecords(
    matchType: string,
    params: any,
    disabled: boolean = false,
    platform: CommonCRMPlatform
) {
    const [matchedNameItems, setMatchedNameItems] = useState<MatchItem[]>([]);
    const [matchedRelatedToItems, setMatchedRelatedToItems] = useState<
        MatchItem[]
    >([]);
    const CrmSvc = useAngularModule('CrmSvc');
    const [isMatched, setIsMatched] = useState(false);

    const shouldInvokeMatch = !disabled;

    const { hasMatched, matchedRecords, reloadMatchedList } = useMatchRecords(
        matchType,
        params,
        undefined,
        shouldInvokeMatch
    );
    const isIncidentLogging =
        CrmSvc.integrateInfo?.callLoggingType === SnCallLoggingType.INCIDENT;
    useEffect(() => {
        if (hasMatched && matchedRecords) {
            const matchedNames = getMatchedItems(
                MatchType.NAME,
                matchedRecords,
                platform,
                isIncidentLogging && matchType === ParamsType.Call
            );
            const matchedRelatedTos = getMatchedItems(
                MatchType.RELATED,
                matchedRecords,
                platform,
                isIncidentLogging && matchType === ParamsType.Call
            );
            setMatchedNameItems(matchedNames);
            setMatchedRelatedToItems(matchedRelatedTos);
            setIsMatched(true);
        }
    }, [hasMatched, matchedRecords]);

    return {
        isMatched,
        matchedNameItems,
        matchedRelatedToItems,
        reloadMatchedList,
    };
}
