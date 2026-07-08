import { useEffect, useState, useCallback, useRef } from 'react';

import { useAngularModule } from './useAngularModule';
import { ParamsType } from '../../../constants/crm';
import type { MatchItem, RecordTypeGroups } from '../types';

export function useMatchRecords(
    matchType: string,
    params: any,
    _matchedRecords: MatchItem[] | undefined,
    shouldInvokeMatch = true,
    _recordTypeGroups?: RecordTypeGroups
) {
    const [matchedRecords, setMatchedRecords] = useState(_matchedRecords);
    const [hasMatched, setHasMatched] = useState(false);
    const [recordTypeGroups, setRecordTypeGroups] =
        useState<RecordTypeGroups>();
    const [reloadTrigger, setReloadTrigger] = useState(0);
    const lastReloadTime = useRef(0);
    const CrmSvc = useAngularModule('CrmSvc');
    const AnalyticsSvc = useAngularModule('AnalyticsSvc');

    useEffect(() => {
        if (!shouldInvokeMatch && reloadTrigger === 0) {
            return;
        }
        const matchContacts = async () => {
            const { records, recordTypeGroups } = await CrmSvc.matchContacts({
                type: matchType,
                params: {
                    ...params,
                    isReload: reloadTrigger > 0,
                },
            });
            setMatchedRecords(records || []);
            setRecordTypeGroups(recordTypeGroups);
            setHasMatched(true);
        };
        matchContacts();
    }, [reloadTrigger]);

    useEffect(() => {
        if (_matchedRecords) {
            setMatchedRecords(_matchedRecords);
            setRecordTypeGroups(_recordTypeGroups);
            setHasMatched(true);
        }
    }, [_matchedRecords]);

    const reloadMatchedList = useCallback(() => {
        const now = Date.now();
        if (now - lastReloadTime.current < 1000) {
            return;
        }
        lastReloadTime.current = now;
        setReloadTrigger((prev) => prev + 1);
        AnalyticsSvc.track('RCX_match_Reload', {
            method: matchType === ParamsType.Call ? 'voice' : 'digital',
        });
    }, []);

    return {
        hasMatched,
        matchedRecords,
        recordTypeGroups,
        reloadMatchedList,
        isReload: reloadTrigger > 0,
    };
}
