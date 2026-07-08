import { useState, useEffect, useCallback, useRef } from 'react';

import { getQueueAvailability } from '../../../common/services/transport/requeue';
import { METRICS_POLLING_INTERVAL } from '../constants';
import type { QueueMetrics } from '../types';

interface UseQueueMetricsParams {
    queueIds: number[];
    rcxSubAccountId: string;
    isRequeueOpen: boolean;
}

interface UseQueueMetricsResult {
    metricsMap: Record<number, QueueMetrics>;
    metricsLoaded: boolean;
}

export const useQueueMetrics = ({
    queueIds,
    rcxSubAccountId,
    isRequeueOpen,
}: UseQueueMetricsParams): UseQueueMetricsResult => {
    const [metricsMap, setMetricsMap] = useState<Record<number, QueueMetrics>>(
        {}
    );
    const [metricsLoaded, setMetricsLoaded] = useState(false);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const savedQueueIdsRef = useRef<number[]>(queueIds);
    const savedRcxSubAccountIdRef = useRef<string>(rcxSubAccountId);
    const lastFetchKeyRef = useRef<string>('');

    const dataKey = `${queueIds.join(',')}:${rcxSubAccountId}`;

    const fetchQueueMetrics = useCallback(async () => {
        if (!isRequeueOpen) return;
        if (
            savedQueueIdsRef.current.length === 0 ||
            !savedRcxSubAccountIdRef.current
        ) {
            return;
        }

        const res = await getQueueAvailability({
            queueIds: savedQueueIdsRef.current,
            rcxSubAccountId: savedRcxSubAccountIdRef.current,
            queueType: 'VOICE',
        });

        if (!Array.isArray(res)) return;

        const newMap: Record<number, QueueMetrics> = {};
        for (const metric of res) {
            newMap[metric.queueId] = metric;
        }
        setMetricsMap(newMap);
        setMetricsLoaded(true);
    }, [isRequeueOpen]);

    useEffect(() => {
        savedQueueIdsRef.current = queueIds;
    }, [queueIds]);

    useEffect(() => {
        savedRcxSubAccountIdRef.current = rcxSubAccountId;
    }, [rcxSubAccountId]);

    useEffect(() => {
        if (!isRequeueOpen) {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            lastFetchKeyRef.current = '';
            return;
        }

        const hasValidData = queueIds.length > 0 && rcxSubAccountId;
        const keyChanged = dataKey !== lastFetchKeyRef.current;
        const shouldFetchImmediately = hasValidData && keyChanged;

        if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
        }

        if (shouldFetchImmediately) {
            lastFetchKeyRef.current = dataKey;
            fetchQueueMetrics();
        } else if (hasValidData) {
            lastFetchKeyRef.current = dataKey;
        }

        timerRef.current = setInterval(
            () => fetchQueueMetrics(),
            METRICS_POLLING_INTERVAL
        );

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        };
    }, [isRequeueOpen, dataKey, fetchQueueMetrics]);

    return {
        metricsMap,
        metricsLoaded,
    };
};
