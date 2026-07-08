import { useEffect } from 'react';

import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import type { ICommonPopRecordsProps } from '../../types';
import { DNRecordType } from '../constants';

export function useDynamicsPopRecords({
    currentCall,
    isMatched,
    matchedNameItems = [],
    shouldPopRecordWhenMatched,
    shouldCreateRecordWhenNoMatch,
    shouldPopRecordMoreThanOnce,
}: ICommonPopRecordsProps) {
    const CrmSvc = useAngularModule('CrmSvc');

    useEffect(() => {
        if (!isMatched || currentCall.hasPopupRecords) {
            return;
        }
        if (!shouldPopRecordMoreThanOnce) {
            currentCall.hasPopupRecords = true;
        }
        const current = matchedNameItems.find((item) => item.isCurrent);
        if (current) {
            current.isCurrent = false;
            return;
        }
        if (matchedNameItems.length === 1 && shouldPopRecordWhenMatched) {
            CrmSvc.popRecords({
                type: matchedNameItems[0].type,
                params: matchedNameItems[0].id,
            });
        } else if (
            matchedNameItems.length > 1 &&
            currentCall.ani &&
            shouldPopRecordWhenMatched
        ) {
            CrmSvc.popRecords({
                params: currentCall.ani,
            });
        } else if (
            matchedNameItems.length === 0 &&
            shouldCreateRecordWhenNoMatch
        ) {
            CrmSvc.createRecord({
                type: DNRecordType.Contact,
                call: currentCall,
            });
        }
    }, [
        CrmSvc,
        currentCall,
        isMatched,
        matchedNameItems,
        shouldCreateRecordWhenNoMatch,
        shouldPopRecordMoreThanOnce,
        shouldPopRecordWhenMatched,
    ]);
}
