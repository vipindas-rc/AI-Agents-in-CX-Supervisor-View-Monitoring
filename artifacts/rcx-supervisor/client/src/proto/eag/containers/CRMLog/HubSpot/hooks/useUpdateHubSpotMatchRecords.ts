import {
    useCallback,
    useEffect,
    useLayoutEffect,
    useRef,
    useState,
} from 'react';

import {
    mergeAssociations,
    partitionRecords,
} from './useUpdateHubSpotMatchRecords.helpers';
import type { UpdatedCallMatchRecordsData } from './useUpdateHubSpotMatchRecords.type';
import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import type { MatchItem } from '../../../../components/CRM/types';
import { CRM_ACTIONS } from '../../../../constants/crm';
import { crmEventBus } from '../../../../helpers/crmEventBus';
import type { IHubSpotLogFormData } from '../types';

export function useUpdateHubSpotMatchRecords(
    uii: string,
    formData: IHubSpotLogFormData,
    enabled: boolean,
    handleFormDataChanged: (formData: IHubSpotLogFormData) => void
) {
    const CrmSvc = useAngularModule('CrmSvc');
    const handleFormDataChangedRef = useRef(handleFormDataChanged);
    const formDataRef = useRef(formData);

    useEffect(() => {
        handleFormDataChangedRef.current = handleFormDataChanged;
    }, [handleFormDataChanged]);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const [updatedMatchedAssociations, setUpdatedMatchedAssociations] =
        useState<MatchItem[]>([]);
    const [isRecordUpdated, setIsRecordUpdated] = useState(false);

    const handler = useCallback(
        (data: UpdatedCallMatchRecordsData) => {
            if (!enabled) {
                return;
            }

            const { matchedAssociations, recentlyCreatedAssociations } =
                partitionRecords(data.records || []);

            setUpdatedMatchedAssociations(matchedAssociations);
            setIsRecordUpdated(true);

            const currentAssociations = formDataRef.current.associations;

            if (recentlyCreatedAssociations.length > 0) {
                handleFormDataChangedRef.current({
                    ...formDataRef.current,
                    associations: mergeAssociations(
                        currentAssociations,
                        recentlyCreatedAssociations
                    ),
                });
            }

            CrmSvc?.setUpdatedCallMatchRecords(uii, {
                records: undefined,
            });
        },
        [uii, CrmSvc, enabled]
    );

    const handlerRef = useRef(handler);
    useLayoutEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const eventHandler = (data: UpdatedCallMatchRecordsData) =>
            handlerRef.current(data);

        crmEventBus.on(CRM_ACTIONS.UPDATE_MATCHING_RECORDS, eventHandler);
        return () => {
            crmEventBus.off(CRM_ACTIONS.UPDATE_MATCHING_RECORDS, eventHandler);
        };
    }, []);

    useEffect(() => {
        const existingData = CrmSvc?.updatedCallMatchRecords?.[uii];
        if (existingData?.records) {
            handlerRef.current(existingData);
        }
    }, [uii, CrmSvc]);

    const resetIsRecordUpdated = useCallback(() => {
        setIsRecordUpdated(false);
    }, []);

    return {
        updatedMatchedAssociations,
        isRecordUpdated,
        resetIsRecordUpdated,
    };
}
