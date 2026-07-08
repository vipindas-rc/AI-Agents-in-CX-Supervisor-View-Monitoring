import { useContext } from 'react';

import { useAngularModule } from './useAngularModule';
import { LogKindContext } from '../../../helpers/logKind';
import { DataTrackingEventNames } from '../constants';
import type { MatchItem } from '../types';

export function useCreateRecord(data?: any) {
    const CrmSvc = useAngularModule('CrmSvc');
    const AnalyticsSvc = useAngularModule('AnalyticsSvc');
    const logKind = useContext(LogKindContext);

    const handleCreateRecord = async (
        recordType: string,
        options?: any,
        call = data,
        onSuccessCallback?: (user: MatchItem) => void
    ) => {
        AnalyticsSvc.track(DataTrackingEventNames.RCXMatchCreate, {
            method: logKind?.logKindType,
            type: recordType,
        });
        if (onSuccessCallback) {
            try {
                const result = await CrmSvc.createRecord({
                    type: recordType,
                    call,
                });

                if (result?.success && result.data) {
                    const { id, name } = result.data;
                    id && onSuccessCallback({ id, name, recordType });
                }
            } catch {
                // Error already handled by _displayErrorMessage in crm.service.js
            }
        } else {
            CrmSvc.createRecord({
                type: recordType,
                call,
                ...options,
            });
        }
    };

    return handleCreateRecord;
}
