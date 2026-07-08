import { useEffect, useState } from 'react';

import { useMatchRecords } from '../../../../components/CRM/Hooks/useMatchRecords';
import type { MatchItem } from '../../../../components/CRM/types';

export function useZendeskMatchRecords(
    matchType: string,
    params: any,
    disabled: boolean = false
) {
    const [isMatched, setIsMatched] = useState(false);
    const [matchedUsers, setMatchedUsers] = useState<MatchItem[]>([]);
    const shouldInvokeMatch = !disabled;

    const { hasMatched, matchedRecords } = useMatchRecords(
        matchType,
        params,
        undefined,
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
