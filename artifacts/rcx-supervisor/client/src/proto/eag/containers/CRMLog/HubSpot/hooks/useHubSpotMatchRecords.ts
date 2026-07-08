import { useEffect, useState } from 'react';

import { useMatchRecords } from '../../../../components/CRM/Hooks/useMatchRecords';
import type {
    MatchItem,
    RecordTypeGroups,
} from '../../../../components/CRM/types';
import { RecordType } from '../constants';

export function useHubSpotMatchRecords(matchType: string, params: any) {
    const [matchedItems, setMatchedItems] = useState<MatchItem[]>();
    const [outcomeList, setOutcomeList] = useState<MatchItem[]>([]);
    const [isMatched, setIsMatched] = useState(false);
    const [typeGroups, setTypeGroups] = useState<RecordTypeGroups>();
    const { hasMatched, matchedRecords, recordTypeGroups, reloadMatchedList } =
        useMatchRecords(matchType, params, undefined, true);

    useEffect(() => {
        if (hasMatched && matchedRecords) {
            const outcomeData = matchedRecords.filter(
                (item) => item.type === RecordType.Outcome
            );
            const contactData = matchedRecords.filter(
                (item) => item.type !== RecordType.Outcome
            );
            setMatchedItems(contactData);
            setTypeGroups(recordTypeGroups || { name: [] });
            setOutcomeList(outcomeData);
            setIsMatched(true);
        }
    }, [hasMatched, matchedRecords, recordTypeGroups]);

    return {
        isMatched,
        matchedItems,
        outcomeList,
        typeGroups: typeGroups as RecordTypeGroups,
        reloadMatchedList,
    };
}
