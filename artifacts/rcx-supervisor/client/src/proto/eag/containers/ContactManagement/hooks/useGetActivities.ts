import { useState, useCallback } from 'react';

import { useTranslation } from 'react-i18next';

import type { ActivityLog } from '../../../common/services/transport';
import { getActivities as getActivitiesTransport } from '../../../common/services/transport';
import injector from '../../../helpers/injector';

const DEFAULT_LIMIT = 100;

export const useGetActivities = () => {
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [totalCount, setTotalCount] = useState<number>(0);
    const [offset, setOffset] = useState<number>(0);
    const { t } = useTranslation();
    const [historyList, setHistoryList] = useState<ActivityLog[]>([]);
    const growl = injector('growl');
    const hasMore = offset < totalCount;

    const getActivities = useCallback(
        async ({
            accountId,
            rcxSubAccountId,
            contactId,
            limit = DEFAULT_LIMIT,
            externalId,
            isExternalContact = false,
        }: {
            accountId: string;
            rcxSubAccountId: string;
            contactId: string;
            limit?: number;
            externalId: string;
            isExternalContact?: boolean;
        }) => {
            setError(null);
            setIsLoading(true);

            try {
                const params: {
                    contactId?: string;
                    withDisplayInfo: boolean;
                    limit: number;
                    offset: number;
                    participantType: string;
                    externalContactId?: string;
                } = {
                    contactId: isExternalContact ? undefined : contactId,
                    externalContactId: isExternalContact
                        ? externalId
                        : undefined,
                    withDisplayInfo: true,
                    limit,
                    offset: 0,
                    participantType: 'AGENT',
                };
                const res = await getActivitiesTransport({
                    accountId,
                    rcxSubAccountId,
                    params,
                });
                if (Array.isArray(res?.records)) {
                    setHistoryList((preList) => [...preList, ...res.records]);
                    setOffset(offset + res.records.length);
                    setTotalCount(res.count);
                }
            } catch (e) {
                growl?.error('CHAT.INTERACTION_HISTORY.LOAD_MORE_ERROR_MSG');
                setError(t('CHAT.INTERACTION_HISTORY.LOAD_MORE_ERROR_MSG'));
            }
            setIsLoading(false);
        },
        [growl, offset, t]
    );

    return {
        getActivities,
        historyList,
        error,
        isLoading,
        hasMore,
        totalCount,
        batchCount: DEFAULT_LIMIT,
    };
};
