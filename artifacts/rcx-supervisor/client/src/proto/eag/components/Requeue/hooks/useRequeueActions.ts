import { useCallback } from 'react';

import {
    ANALYTICS_EVENTS,
    ANALYTICS_OPTIONS,
    REQUEUE_TYPE,
    VIEW_STATE,
} from '../constants';
import type { AnalyticsSvc, CrmSvc, CallSvc, ViewState } from '../types';

interface UseRequeueActionsParams {
    AnalyticsSvc: AnalyticsSvc;
    CrmSvc: CrmSvc;
    CallSvc: CallSvc;
    requeueType: REQUEUE_TYPE;
}

interface UseRequeueActionsResult {
    trackSearchInputClick: (
        context: 'Requeue' | 'ChooseSkill' | 'RequeueShortCut'
    ) => void;
    trackChooseSkillClicked: () => void;

    handleRequeue: (params: {
        queueId: string;
        skillId?: string;
        viewState: ViewState;
    }) => void;
    handleAskFirst: (params: { queueId: string; skillId?: string }) => void;
    handleCancel: () => void;
}

export const useRequeueActions = ({
    AnalyticsSvc,
    CrmSvc,
    CallSvc,
    requeueType,
}: UseRequeueActionsParams): UseRequeueActionsResult => {
    const trackSearchInputClick = useCallback(
        (context: 'Requeue' | 'ChooseSkill' | 'RequeueShortCut') => {
            AnalyticsSvc.track(ANALYTICS_EVENTS.SEARCH_INPUT_CLICK, {
                option: context,
            });
        },
        [AnalyticsSvc]
    );

    const trackChooseSkillClicked = useCallback(() => {
        AnalyticsSvc.track(ANALYTICS_EVENTS.CHOOSE_SKILL_CLICKED);
    }, [AnalyticsSvc]);

    const handleRequeue = useCallback(
        (params: {
            queueId: string;
            skillId?: string;
            viewState: ViewState;
        }) => {
            let option: string = ANALYTICS_OPTIONS.REQUEUE;

            if (requeueType === REQUEUE_TYPE.SHORTCUT) {
                option = ANALYTICS_OPTIONS.REQUEUE_SHORTCUT;
            } else if (params.viewState === VIEW_STATE.SKILL_SELECTOR) {
                option = ANALYTICS_OPTIONS.CHOOSE_SKILL;
            }

            AnalyticsSvc.track(ANALYTICS_EVENTS.REQUEUE_CLICKED, { option });

            CallSvc.requeue(params.queueId, params.skillId, false);
            CrmSvc.hideRequeue();
        },
        [AnalyticsSvc, CrmSvc, CallSvc, requeueType]
    );

    const handleAskFirst = useCallback(
        (params: { queueId: string; skillId?: string }) => {
            AnalyticsSvc.track(ANALYTICS_EVENTS.ASK_FIRST_CLICKED);

            CallSvc.requeue(params.queueId, params.skillId, true);
            CrmSvc.hideRequeue();
        },
        [CrmSvc, CallSvc]
    );

    const handleCancel = useCallback(() => {
        CrmSvc.hideRequeue();
    }, [CrmSvc]);

    return {
        trackSearchInputClick,
        trackChooseSkillClicked,

        handleRequeue,
        handleAskFirst,
        handleCancel,
    };
};
