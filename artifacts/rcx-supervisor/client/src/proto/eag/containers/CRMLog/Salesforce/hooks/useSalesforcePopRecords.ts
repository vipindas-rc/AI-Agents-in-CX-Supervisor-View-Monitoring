import { useEffect } from 'react';

import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import { CRMCallTypes } from '../../../../constants/crm';
import type { ICommonPopRecordsProps } from '../../types';

export function useSalesforcePopRecords({
    currentCall,
    isMatched,
    shouldPopRecordWhenMatched,
}: ICommonPopRecordsProps) {
    const CrmSvc = useAngularModule('CrmSvc');

    useEffect(() => {
        if (
            isMatched &&
            shouldPopRecordWhenMatched &&
            currentCall.callType?.toUpperCase() === CRMCallTypes.Outbound
        ) {
            CrmSvc.onLeadPreview(currentCall.lead);
        }
    }, [
        CrmSvc,
        currentCall.callType,
        currentCall.lead,
        shouldPopRecordWhenMatched,
        isMatched,
    ]);
}
