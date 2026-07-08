import { useEffect } from 'react';

import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import { useCreateRecord } from '../../../../components/CRM/Hooks/useCreateRecord';
import { RecordType } from '../constants';
import type { IFreshdeskPopupData } from '../types';

export function useFreshdeskPopRecords({
    disabled,
    isMatched,
    engageInfo,
    matchedUsers,
    shouldPopRecordWhenMatched,
    shouldCreateRecordWhenNoMatch,
    shouldPopRecordMoreThanOnce,
    afterCreateUser,
}: IFreshdeskPopupData) {
    const CrmSvc = useAngularModule('CrmSvc');
    const handleCreateRecord = useCreateRecord();
    useEffect(() => {
        if (disabled || !isMatched) {
            return;
        }
        if (
            matchedUsers.length === 1 &&
            shouldPopRecordWhenMatched &&
            !engageInfo.hasPopupRecords
        ) {
            CrmSvc.popRecords({
                type: RecordType.User,
                params: matchedUsers[0].id,
            });
            if (!shouldPopRecordMoreThanOnce) {
                engageInfo.hasPopupRecords = true;
            }
        } else if (matchedUsers.length === 0 && shouldCreateRecordWhenNoMatch) {
            handleCreateRecord(
                RecordType.User,
                undefined,
                engageInfo,
                afterCreateUser
            );
        }
    }, [
        isMatched,
        matchedUsers,
        disabled,
        shouldPopRecordWhenMatched,
        shouldCreateRecordWhenNoMatch,
        CrmSvc,
        engageInfo,
        shouldPopRecordMoreThanOnce,
    ]);
}
