import { useState, useEffect, useCallback } from 'react';

import {
    ANALYTICS_EVENTS,
    ANALYTICS_OPTIONS,
    REQUEUE_TYPE,
    VIEW_STATE,
} from '../constants';
import { useQueueMetrics } from './useQueueMetrics';
import type {
    RequeueQueue,
    RequeueShortcut,
    Skill,
    CallSvc,
    AcdSvc,
    AgentSvc,
    AnalyticsSvc,
    ViewState,
    RequeueGroup,
    QueueMetrics,
} from '../types';

interface UseRequeueDataParams {
    CallSvc: CallSvc;
    AcdSvc: AcdSvc;
    AgentSvc: AgentSvc;
    AnalyticsSvc: AnalyticsSvc;
    isRequeueOpen: boolean;
}

interface UseRequeueDataResult {
    requeueType: REQUEUE_TYPE;
    allowCrossQueueRequeue: boolean;

    viewState: ViewState;
    setViewState: (state: ViewState) => void;

    queues: RequeueQueue[];
    shortcuts: RequeueShortcut[];

    metricsMap: Record<number, QueueMetrics>;
    metricsLoaded: boolean;

    selectedQueue: RequeueQueue | null;
    selectedShortcut: RequeueShortcut | null;
    selectedSkill: Skill | null;

    selectQueue: (queue: RequeueQueue | null) => void;
    selectShortcut: (shortcut: RequeueShortcut | null) => void;
    selectSkill: (skill: Skill | null) => void;
    clearSelection: () => void;
}

export const useRequeueData = ({
    CallSvc,
    AcdSvc,
    AgentSvc,
    AnalyticsSvc,
    isRequeueOpen,
}: UseRequeueDataParams): UseRequeueDataResult => {
    const [viewState, setViewState] = useState<ViewState>(
        VIEW_STATE.QUEUE_LIST
    );
    const [queues, setQueues] = useState<RequeueQueue[]>([]);
    const [selectedQueue, setSelectedQueue] = useState<RequeueQueue | null>(
        null
    );
    const [selectedShortcut, setSelectedShortcut] =
        useState<RequeueShortcut | null>(null);
    const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);

    const requeueType =
        CallSvc.currentCall?.requeueType ?? REQUEUE_TYPE.ADVANCED;
    const allowCrossQueueRequeue =
        AgentSvc.agentPermissions?.allowCrossQueueRequeue ?? true;
    const shortcuts = CallSvc.currentCall?.requeueShortcuts ?? [];
    const rcxSubAccountId = AgentSvc.agentSettings?.accountId ?? '';

    useEffect(() => {
        if (!isRequeueOpen) return;
        if (requeueType === REQUEUE_TYPE.ADVANCED) {
            const availableRequeueGroups =
                AcdSvc.getAvailableRequeues?.() ?? [];
            const flattenedQueues: RequeueQueue[] = [];
            (availableRequeueGroups as RequeueGroup[]).forEach((group) => {
                if (group.gates) {
                    group.gates.forEach((queue) => {
                        flattenedQueues.push({
                            ...queue,
                            groupName: group.groupName,
                            groupSkills: group.skills,
                        });
                    });
                }
            });
            setQueues(flattenedQueues);
        }
    }, [isRequeueOpen, requeueType, AcdSvc]);

    useEffect(() => {
        if (
            !isRequeueOpen ||
            requeueType !== REQUEUE_TYPE.ADVANCED ||
            queues.length === 0 ||
            selectedQueue !== null
        ) {
            return;
        }

        const currentCallQueue = CallSvc.currentCall?.queue;

        if (!currentCallQueue) return;

        const queueToSelect = currentCallQueue.isCampaign
            ? queues[0]
            : currentCallQueue.number
              ? queues.find((q) => q.gateId === currentCallQueue.number)
              : undefined;

        if (queueToSelect) {
            setSelectedQueue(queueToSelect);
            if (!allowCrossQueueRequeue) {
                setViewState(VIEW_STATE.SKILL_SELECTOR);
            }
        }
    }, [
        isRequeueOpen,
        requeueType,
        queues,
        selectedQueue,
        allowCrossQueueRequeue,
        CallSvc.currentCall,
    ]);

    const queueIds =
        requeueType === REQUEUE_TYPE.ADVANCED
            ? queues.map((q) => Number(q.gateId)).filter((id) => !!id)
            : shortcuts.map((s) => Number(s.gateId)).filter((id) => !!id);

    const { metricsMap, metricsLoaded } = useQueueMetrics({
        queueIds,
        rcxSubAccountId,
        isRequeueOpen,
    });

    const selectQueue = useCallback(
        (queue: RequeueQueue | null) => {
            if (!queue) return;
            setSelectedQueue(queue);
            setSelectedShortcut(null);
            setSelectedSkill(null);
            AnalyticsSvc.track(ANALYTICS_EVENTS.REQUEUE_SELECTED, {
                option: ANALYTICS_OPTIONS.REQUEUE,
            });
        },
        [AnalyticsSvc]
    );

    const selectShortcut = useCallback(
        (shortcut: RequeueShortcut | null) => {
            if (!shortcut) return;
            setSelectedShortcut(shortcut);
            setSelectedQueue(null);
            setSelectedSkill(null);
            AnalyticsSvc.track(ANALYTICS_EVENTS.REQUEUE_SELECTED, {
                option: ANALYTICS_OPTIONS.REQUEUE_SHORTCUT,
            });
        },
        [AnalyticsSvc]
    );

    const selectSkill = useCallback(
        (skill: Skill | null) => {
            if (!skill) return;
            setSelectedSkill(skill);
            AnalyticsSvc.track(ANALYTICS_EVENTS.REQUEUE_SELECTED, {
                option: ANALYTICS_OPTIONS.SKILL,
            });
        },
        [AnalyticsSvc]
    );

    const clearSelection = useCallback(() => {
        setSelectedQueue(null);
        setSelectedShortcut(null);
        setSelectedSkill(null);
        setViewState(VIEW_STATE.QUEUE_LIST);
    }, []);

    return {
        requeueType,
        allowCrossQueueRequeue,

        viewState,
        setViewState,

        queues,
        shortcuts,

        metricsMap,
        metricsLoaded,

        selectedQueue,
        selectedShortcut,
        selectedSkill,

        selectQueue,
        selectShortcut,
        selectSkill,
        clearSelection,
    };
};
