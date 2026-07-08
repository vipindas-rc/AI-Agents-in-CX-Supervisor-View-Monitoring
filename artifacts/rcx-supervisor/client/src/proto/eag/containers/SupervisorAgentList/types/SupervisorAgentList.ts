import type { PropertyPath } from '@ringcx/shared';
import type { RenderSubRowData, RenderRowGroupData } from '@ringcx/ui';

import type { MONITOR_TYPES } from '../../../constants/app';
import type {
    IChatSourceColor,
    IChatType,
} from '../../Chat/ChatList/components/ChatCard/types/ChatCard';
export type AgentSearchRowsType = {
    agentState: string;
    activeInteractionsSearchCols: ActiveInteractionType;
    agentId: string;
    fullName: string;
    skill: string;
};
export type ISupervisorAgentListItem = {
    glId: string;
    agentId: string;
    rcUserId: string;
    fullName: string;
    agentState: string;
    agentType?: string;
    status?: string;
    stateDuration: number;
    activeInteractions: IActiveInteraction[];
    activeInteractionsSearchCols?: IActiveInteraction[];
    longestActiveInteraction: number;
    pendingDispTime: number;
    interactionsRollup: number;
    interactions24hRollupTotalCount: number;
    interactions24hRollupData: IInteraction[];
    talkTime: number;
    averageTimePerCall: number;
    skill: string;
    login: number;
    utilization: number;
    longestEngagement: any;
    agentBaseState: string;
    showMonitor: boolean;
    showLogout: boolean;
    showChangeState: boolean;
    disabledTooltip?: string;
    isHidden?: boolean | undefined;
    subRows?: RenderSubRowData<AgentSearchRowsType>[];
};

type noop = (a?: any, b?: any) => {};

export interface ISupervisorAgentListRow {
    data: ISupervisorAgentListItem;
    columns: ISupervisorTableCol[];
    loggedInAgentId: string;
    onInteractionsClick: noop;
    onLogOut: noop;
    changeAgentState: noop;
    monitorAgentCallback: noop;
    monitoredAgent: IMonitorMenuInfo;
    onInteractionRollupClick: noop;
    isChangeAgentStateAvailable: boolean;
}

export interface ISupervisorTableCol {
    id: string;
    content: string;
    translationPath?: string;
    sortAs: number;
    visible: boolean;
    width: number;
    maxWidth?: number;
    disabled?: boolean;
    hiddenColumn?: boolean;
}

export interface ISupervisorAgentList {
    agentList: ISupervisorAgentListItem[];
    columns: ISupervisorTableCol[];
    loggedInAgentId: string;
    callTotalsLoading: boolean;
    onInteractionsClick: () => {};
    onLogOut: () => {};
    changeAgentState: () => {};
    monitorAgentCallback: () => {};
    monitoredAgent: IMonitorMenuInfo;
    selectedStates: string[];
    selectedChannels: string[];
    searchValue: string;
    onInteractionRollupClick: noop;
}

export interface IInteraction {
    sourceType: IChatType;
    count: number;
    sourceId?: string;
    sourceColor?: IChatSourceColor;
    sourceName?: string;
}
export interface ILongestEngagement {
    sourceId: string;
    sourceName: string;
    sourceType: IChatType;
    sourceColor: IChatSourceColor;
    agentDurationMs: number;
}
export interface IMonitorMenuInfo {
    monitoredAgentId: string;
    uii: string;
}

export interface IActiveInteraction {
    channelType: IChatType;
    sourceColor: IChatSourceColor;
}

export type MonitorVoiceAction = (
    agentId: string,
    monitorType: MONITOR_TYPES,
    uii: string,
    sourceType: string,
    skipConfirmation?: boolean
) => void;

export interface IGetHoveredItems {
    onLogOut: () => void;
    changeAgentState: () => void;
    agentId: string;
    rcUserId: string;
    monitorVoice: MonitorVoiceAction;
    monitoredAgent: IMonitorMenuInfo;
    showMonitor: boolean;
    showLogout: boolean;
    showChangeState: boolean;
    disabledTooltip?: string;
    agentBaseState: string;
    agentState: string;
    isChangeAgentStateAvailable: boolean;
    fullName: string;
}
type ActiveInteractionType = {
    sourceName: string;
};
export const agentStatesCol: PropertyPath<AgentSearchRowsType>[] = [
    ['agentState'],
];
export const agentChannelCol: PropertyPath<AgentSearchRowsType>[] = [
    ['activeInteractionsSearchCols', 'sourceName'],
];
export const agentSearchIndexes: PropertyPath<AgentSearchRowsType>[] = [
    ['agentState'],
    ['fullName'],
    ['skill'],
    ['activeInteractionsSearchCols', 'sourceName'],
];

export type AgentRows = RenderRowGroupData<
    ISupervisorAgentListItem,
    AgentSearchRowsType
>;
