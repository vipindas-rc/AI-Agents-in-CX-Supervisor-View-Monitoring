import type { BehaviorSubject } from 'rxjs';

import type { REQUEUE_TYPE } from './constants';

export interface CallSvc {
    currentCall: CurrentCall;
    requeue: (queueId: string, skillId?: string, stayOnCall?: boolean) => void;
}

export interface CurrentCall {
    requeueType: REQUEUE_TYPE;
    requeueShortcuts: RequeueShortcut[];
    callType: 'INBOUND' | 'OUTBOUND';
    gateId?: string;
    queue?: {
        number?: string;
        isCampaign?: boolean;
    };
}

export interface RequeueGroup {
    groupName: string;
    gates: RequeueQueue[];
    skills?: Skill[];
}

export interface AcdSvc {
    getAvailableRequeues: () => RequeueQueue[] | RequeueGroup[];
}

export interface AgentSvc {
    agentPermissions: AgentPermissions;
    agentSettings: AgentSettings;
}

export interface AgentSettings {
    accountId: string;
}

export interface AgentPermissions {
    allowCrossQueueRequeue: boolean;
}

export interface AnalyticsSvc {
    track: (eventName: string, params?: Record<string, string>) => void;
}

export interface CrmSvc {
    requeueOpen: boolean;
    $requeueOpen: BehaviorSubject<boolean>;
    showRequeue: () => void;
    hideRequeue: () => void;
    doRequeue: (params: RequeueParams) => void;
}

export interface RequeueQueue {
    gateId: string;
    gateName: string;
    groupName: string;
    groupSkills?: Skill[];
}

export interface RequeueShortcut {
    name: string;
    gateId: string;
    skillId?: string;
    rank: number;
}

export interface Skill {
    skillId: string;
    skillName: string;
}

export interface QueueMetrics {
    queueId: number;
    longestWaitingTimeInSeconds: number;
    numberOfAgentsAvailable: number;
    numberOfAgentsLoggedIn: number;
    isQueueOpen: boolean;
}

export interface RequeueParams {
    queueId: string;
    skillId?: string;
    stayOnCall?: boolean;
}

export interface RequeueProps {
    CallSvc: CallSvc;
    AcdSvc: AcdSvc;
    AgentSvc: AgentSvc;
    AnalyticsSvc: AnalyticsSvc;
    CrmSvc: CrmSvc;
}

export interface QueueItemProps {
    queue: RequeueQueue | RequeueShortcut;
    metrics?: QueueMetrics;
    isSelected: boolean;
    metricsLoaded: boolean;
    onClick: () => void;
    isAdvanced?: boolean;
}

export interface AdvancedQueueListProps {
    queues: RequeueQueue[];
    metricsMap: Record<number, QueueMetrics>;
    selectedQueueId: string | null;
    onSelectQueue: (queue: RequeueQueue) => void;
    searchQuery: string;
    metricsLoaded: boolean;
}

export interface ShortcutListProps {
    shortcuts: RequeueShortcut[];
    metricsMap: Record<number, QueueMetrics>;
    selectedShortcutId: string | null;
    onSelectShortcut: (shortcut: RequeueShortcut) => void;
    searchQuery: string;
    metricsLoaded: boolean;
}

export interface SkillSelectorProps {
    skills: Skill[];
    selectedSkillId: string | null;
    onSelectSkill: (skill: Skill) => void;
    searchQuery: string;
    isCrossQueueDisabledAndNoSkills: boolean;
}

export interface ActionButtonsProps {
    mode: REQUEUE_TYPE;
    isQueueSelected: boolean;
    hasSkills: boolean;
    viewState: ViewState;
    onChooseSkill: () => void;
    onAskFirst: () => void;
    onRequeue: () => void;
}

export type ViewState = 'queue-list' | 'skill-selector';
