import { useEffect } from 'react';

import { useCreateRecord } from '../../../../components/CRM/Hooks/useCreateRecord';
import { RecordType } from '../constants';
import type { IZendeskPopupData } from '../types';

export function useZendeskPopRecords({
    disabled,
    isMatched,
    engageInfo,
    matchedUsers,
    afterCreateUser,
    shouldCreateRecordWhenNoMatch,
}: IZendeskPopupData) {
    const handleCreateRecord = useCreateRecord();

    useEffect(() => {
        if (disabled || !isMatched) {
            return;
        }
        if (matchedUsers.length === 0 && shouldCreateRecordWhenNoMatch) {
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
        shouldCreateRecordWhenNoMatch,
        engageInfo,
    ]);
}
