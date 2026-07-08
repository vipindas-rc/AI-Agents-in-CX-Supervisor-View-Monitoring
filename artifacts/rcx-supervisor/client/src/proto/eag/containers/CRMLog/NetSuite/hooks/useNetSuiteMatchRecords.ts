import { useEffect, useState } from 'react';

import { useMatchRecords } from '../../../../components/CRM/Hooks/useMatchRecords';
import type {
    MatchItem,
    RecordTypeGroups,
} from '../../../../components/CRM/types';

export function useNetSuiteMatchRecords(matchType: string, params: any) {
    const [matchedItems, setMatchedItems] = useState<MatchItem[]>([]);
    const [isMatched, setIsMatched] = useState(false);
    const [typeGroups, setTypeGroups] = useState<
        RecordTypeGroups | undefined
    >();

    const { hasMatched, matchedRecords, recordTypeGroups, reloadMatchedList } =
        useMatchRecords(matchType, params, undefined, true);

    useEffect(() => {
        if (hasMatched && matchedRecords) {
            setMatchedItems(matchedRecords);
            setTypeGroups(recordTypeGroups);
            setIsMatched(true);
        }
    }, [hasMatched, matchedRecords, recordTypeGroups]);

    return {
        isMatched,
        matchedItems,
        typeGroups,
        reloadMatchedList,
    };
}
