import { useEffect, useState } from 'react';

import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import { useMatchRecords } from '../../../../components/CRM/Hooks/useMatchRecords';
import type { MatchItem } from '../../../../components/CRM/types';
import { ParamsType } from '../../../../constants/crm';

export function useFreshdeskMatchRecords(
    matchType: string,
    params: any,
    disabled: boolean = false
) {
    const [isMatched, setIsMatched] = useState(false);
    const CrmSvc = useAngularModule('CrmSvc');
    const [matchedUsers, setMatchedUsers] = useState<MatchItem[]>([]);
    const shouldInvokeMatch = !(
        disabled ||
        (matchType === ParamsType.DIGITAL &&
            CrmSvc.messageMatchedRecords[params.uii]?.records?.length)
    );

    let matchedContacts;

    if (
        matchType === ParamsType.DIGITAL &&
        CrmSvc.messageMatchedRecords[params.uii]?.records?.length
    ) {
        matchedContacts = CrmSvc.messageMatchedRecords[params.uii].records;
    }

    const { hasMatched, matchedRecords } = useMatchRecords(
        matchType,
        params,
        matchedContacts,
        shouldInvokeMatch
    );
    useEffect(() => {
        if (hasMatched && matchedRecords) {
            setMatchedUsers(matchedRecords);
            setIsMatched(true);
        }
    }, [hasMatched, matchedRecords]);

    return { isMatched, matchedUsers };
}
