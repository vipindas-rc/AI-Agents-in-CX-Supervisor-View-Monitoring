import { useEffect, useCallback, useState, useRef } from 'react';

import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import type { MatchItem } from '../../../../components/CRM/types';
import { CRM_ACTIONS } from '../../../../constants/crm';
import { crmEventBus } from '../../../../helpers/crmEventBus';
import { SnCallLoggingType } from '../../ServiceNow/constants';
import type { CommonCRMPlatform, FormData } from '../types';
import { MatchType } from '../types';
import { getMatchedItems } from '../utils';

interface UpdatedCallMatchRecordsData {
    lastCreatedName?: MatchItem;
    lastCreatedRelatedTo?: MatchItem;
    records?: MatchItem[];
}

/**
 * @description resolve EOINT-7108, update the matched page when crm adapter send the updated match records after create new records
 * @param uii
 * @param platform
 * @param formData
 * @param enabled
 * @param handleFormDataChanged
 */
export function useUpdateMatchRecords(
    uii: string,
    platform: CommonCRMPlatform,
    formData: FormData,
    enabled: boolean,
    handleFormDataChanged: (formData: FormData) => void
) {
    const CrmSvc = useAngularModule('CrmSvc');
    const handleFormDataChangedRef = useRef(handleFormDataChanged);
    const formDataRef = useRef(formData);
    const isIncidentLogging =
        CrmSvc.integrateInfo?.callLoggingType === SnCallLoggingType.INCIDENT;
    useEffect(() => {
        handleFormDataChangedRef.current = handleFormDataChanged;
    }, [handleFormDataChanged]);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const [updatedMatchedNameItems, setUpdatedMatchedNameItems] = useState<
        MatchItem[]
    >([]);
    const [updatedMatchedRelatedToItems, setUpdatedMatchedRelatedToItems] =
        useState<MatchItem[]>([]);
    const [isRecordUpdated, setIsRecordUpdated] = useState(false);

    const handler = useCallback(
        (data: UpdatedCallMatchRecordsData) => {
            if (!enabled) {
                return;
            }

            const matchedNames = getMatchedItems(
                MatchType.NAME,
                data.records || [],
                platform,
                isIncidentLogging
            );
            const matchedRelatedTos = getMatchedItems(
                MatchType.RELATED,
                data.records || [],
                platform,
                isIncidentLogging
            );
            setUpdatedMatchedNameItems(matchedNames);
            setUpdatedMatchedRelatedToItems(matchedRelatedTos);
            setIsRecordUpdated(true);
            const recentlyCreatedName = matchedNames.find(
                (item) => item.recentlyCreated
            );
            const recentlyCreatedRelatedTo = matchedRelatedTos.find(
                (item) => item.recentlyCreated
            );
            let updatedName;
            let updatedRelatedTo;
            // only update the name if the new record is recently created and not have been set to the form data
            if (
                recentlyCreatedName &&
                recentlyCreatedName.id !== data.lastCreatedName?.id
            ) {
                updatedName = recentlyCreatedName;
            }
            // means this new record is recently deleted during the call
            if (
                !recentlyCreatedName &&
                formDataRef.current?.name?.recentlyCreated
            ) {
                updatedName = { id: '', name: '' };
            }
            // only update the related to if the new record is recently created and not have been set to the form data
            if (
                recentlyCreatedRelatedTo &&
                recentlyCreatedRelatedTo.id !== data.lastCreatedRelatedTo?.id
            ) {
                updatedRelatedTo = recentlyCreatedRelatedTo;
            }
            // means this new record is recently deleted during the call, need to unlink the related to
            if (
                !recentlyCreatedRelatedTo &&
                formDataRef.current?.relatedTo?.recentlyCreated
            ) {
                updatedRelatedTo = { id: '', name: '' };
            }

            if (updatedName || updatedRelatedTo) {
                handleFormDataChangedRef.current({
                    ...formDataRef.current,
                    name: updatedName || formDataRef.current.name,
                    relatedTo:
                        updatedRelatedTo || formDataRef.current.relatedTo,
                });
            }

            CrmSvc.setUpdatedCallMatchRecords(uii, {
                records: undefined,
                ...(recentlyCreatedName
                    ? {
                          lastCreatedName: recentlyCreatedName,
                      }
                    : {}),
                ...(recentlyCreatedRelatedTo
                    ? {
                          lastCreatedRelatedTo: recentlyCreatedRelatedTo,
                      }
                    : {}),
            });
        },
        [platform, uii, CrmSvc, enabled]
    );

    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        crmEventBus.on(CRM_ACTIONS.UPDATE_MATCHING_RECORDS, handlerRef.current);
        return () => {
            crmEventBus.off(
                CRM_ACTIONS.UPDATE_MATCHING_RECORDS,
                handlerRef.current
            );
        };
    }, []);

    useEffect(() => {
        const updatedCallMatchRecordsData = CrmSvc.updatedCallMatchRecords[uii];
        if (updatedCallMatchRecordsData?.records) {
            handlerRef.current(updatedCallMatchRecordsData);
        }
    }, [uii, CrmSvc]);

    const resetIsRecordUpdated = useCallback(() => {
        setIsRecordUpdated(false);
    }, []);

    return {
        updatedMatchedNameItems,
        updatedMatchedRelatedToItems,
        isRecordUpdated,
        resetIsRecordUpdated,
    };
}
