import { useState, useCallback } from 'react';

import { UserService } from '@ringcx/shared';

import type { ExternalData } from '../../../common/services/transport';
import { getActivities as getActivitiesTransport } from '../../../common/services/transport';

interface UseCheckExternalContactProps {
    AgentSvc: any;
    externalData: ExternalData | Record<string, unknown>;
    isHistoryPage?: boolean;
    segmentId: string;
}

export const useCheckExternalContact = ({
    AgentSvc,
    segmentId,
    externalData,
    isHistoryPage = false,
}: UseCheckExternalContactProps) => {
    const [isCheckingExternalContact, setIsCheckingExternalContact] =
        useState(true);
    const [isExternalContact, setIsExternalContact] = useState(false);
    const [externalId, setExternalId] = useState<string>('');

    const fullUserDetails = UserService.getFullUserDetails();
    const rcAccountId = fullUserDetails?.rcAccountId || '';
    const rcxSubAccountId = AgentSvc?.agentSettings?.accountId || '';
    const externalIdFromSessionData = externalData?.id;

    const checkIsExternalContact = useCallback(async () => {
        try {
            if (isHistoryPage) {
                const res = await getActivitiesTransport({
                    accountId: rcAccountId,
                    rcxSubAccountId,
                    params: {
                        segmentId,
                        withDisplayInfo: false,
                    },
                });

                const externalContactId = res?.records?.[0]?.externalContactId;
                if (externalContactId) {
                    setIsExternalContact(true);
                    setExternalId(externalContactId);
                }
                return;
            }

            if (externalIdFromSessionData) {
                setIsExternalContact(true);
                setExternalId(externalIdFromSessionData as string);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setIsCheckingExternalContact(false);
        }
    }, [
        isHistoryPage,
        rcAccountId,
        rcxSubAccountId,
        segmentId,
        externalIdFromSessionData,
    ]);

    return {
        isCheckingExternalContact,
        isExternalContact,
        externalId,
        checkIsExternalContact,
    };
};
