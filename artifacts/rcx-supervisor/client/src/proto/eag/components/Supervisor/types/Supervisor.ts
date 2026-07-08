import type { MONITOR_TYPES } from '../../../constants/app';
import type {
    IChatSourceColor,
    IChatType,
} from '../../../containers/Chat/ChatList/components/ChatCard/types/ChatCard';

export interface ISupervisorCrm {
    supervisorSvc: any;
    AgentSvc: any;
    ApplicationSvc: any;
    MonitorSvc: any;
    CallSvc: any;
    Dialog?: any;
    searchValue: string;
    isSelectedInCrm: boolean;
    segmentIndex: number;
    setSegmentIndex: (index: number) => void;
    showTableConfig: () => void;
    syncSelectedAgents: () => void;
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
}
export interface ISupervisorAgentList {
    agentList: ISupervisorAgentListItem[];
    loggedInAgentId: string;
    callTotalsLoading: boolean;
    onInteractionsClick: () => {};
    onLogOut: () => {};
    monitorAgentCallback: MonitorAgent;
    monitoredAgent: IMonitorMenuInfo;
    selectedStates: string[];
    selectedChannels: string[];
    filterColumns: ISupervisorTableCol[];
    searchValue: string;
    onInteractionRollupClick: noop;
    setIsSelectedInCrm: noop;
    showTableConfig: () => void;
    AgentSvc: any;
    Dialog: any;
}
export interface IDigitalInteractionTable {
    digitalTaskList: InteractionData[];
    agentList: ISupervisorAgentListItem[];
    monitorAgentCallback: () => void;
    monitoredAgent: IMonitorMenuInfo;
    loggedInAgentId: string;
    selectedIds: string[];
    selectedChannels: string[];
    searchValue: string;
    AgentSvc: any;
    CallSvc: any;
    MonitorSvc: any;
    filterColumns: any;
    setIsSelectedInCrm: noop;
    showTableConfig: () => void;
    digitalTaskMonitor: (
        agentId: string,
        uii: string,
        agent: ISupervisorAgentListItem
    ) => void;
}
type InteractionConnections = {
    connectionId: string;
    connectionSourceType: string;
};
type EngagementSource = {
    initialEngagementSourceId: string;
    initialEngagementSourceType: string;
    initialEngagementSourceName: string;
    initialEngagementSourceColor: string;
    connections: InteractionConnections;
};
export type InteractionData = {
    agentId: string;
    fullName: string;
    sourceName: string;
    isHidden?: boolean | undefined;
    glId: string;
    engagementId: string;
    isActive: boolean;
    isLegacyChat: boolean;
    contactIdentity: string;
    threadTitle: string;
    showBargeIn?: boolean;
    showMonitor?: boolean;
    showCoach?: boolean;
    agentDurationMs?: string | number;
    focusedConnectionId: string;
    productId: string;
    productName: string;
    pendingDispositionMs: string;
    engagementSource: EngagementSource;
    monitorDisabledTooltip?: string;
    bargeInDisabledTooltip?: string;
    coachDisabledTooltip?: string;
};

export type MonitorAgent = (
    agentId: string,
    monitorType: MONITOR_TYPES,
    uii: string,
    sourceType: string
) => void;
export interface ISupervisorAgentListRow {
    data: ISupervisorAgentListItem;
    loggedInAgentId: string;
    onAgentSelect: (id: string) => void;
    monitorAgentCallback: MonitorAgent;
    monitoredAgent: IMonitorMenuInfo;
    filterColumns?: ISupervisorTableCol[];
    onBackPressed?: () => void;
    AgentSvc: any;
}
export interface ISupervisorAgentListRowDetails {
    data: ISupervisorAgentListItem;
    onLogOut: noop;
    loggedInAgentId: string;
    monitorAgentCallback: MonitorAgent;
    monitoredAgent: IMonitorMenuInfo;
    filterColumns?: ISupervisorTableCol[];
    onBackPressed?: () => void;
    showTableConfig: () => void;
    Dialog: any;
    AgentSvc: any;
}
export interface ICurrentAgentState {
    color: string;
    label: string;
    value: string;
    translatedStateLabel?: string;
}
export interface IAgentStatusContainer {
    isChangeAgentStateDisabled: boolean;
    stateColor: string;
    agentState: string;
    currentAgentStateList: ICurrentAgentState[];
    AgentSvc: any;
    agentId: string;
    agentBaseState: string;
    isCurrentAgent: boolean;
    currentAgentState?: string;
    currentAgentAuxState?: string;
}
export interface IPopUpItems {
    data: ICurrentAgentState;
    onClickHandler: (
        e: React.MouseEvent<HTMLLIElement>,
        data: ICurrentAgentState
    ) => void;
    tabIndex?: number;
}
export interface ISupervisorDigitalListRow {
    data: any;
    agentList: ISupervisorAgentListItem[];
    monitorAgentCallback: () => void;
    onDigitalClick: (agentId: string) => void;
    monitoredAgent: IMonitorMenuInfo;
    loggedInAgentId: string;
    digitalAgentEnabled: boolean;
    MonitorSvc?: any;
    CallSvc?: any;
    digitalTaskMonitor: (
        agentId: string,
        uii: string,
        agent: ISupervisorAgentListItem
    ) => void;
}
export interface IMonitorCall {
    MonitorSvc: any;
    CallSvc: any;
    AgentSvc: any;
    ApplicationSvc: any;
}
export interface IMenuOptions {
    id: string;
    title: string;
    action: () => void;
    isDisabled?: boolean;
    className?: string;
}
export interface IMenu {
    options: IMenuOptions[];
    shouldHide: boolean;
}
export interface IMonitorMenuDropdown {
    options: IMenuOptions[];
    isOpen: boolean;
    modalRef: any;
}
export interface ISupervisorTobBar {
    SupervisorSvc: any;
    ApplicationSvc: any;
    AgentSvc: any;
    searchValue: string;
    segmentIndex: number;
    isSelectedInCrm: boolean;
    setSegmentIndex: (i: number) => void;
    showTableConfig: () => void;
    syncSelectedAgents: () => void;
}
export interface Session {
    onHold?: boolean;
    sessionId?: string;
    destination?: string;
}

export interface Sessions {
    [key: string]: Session | {};
}
export interface ISupervisorDigitalListRowDetails {
    filterColumns: ISupervisorTableCol[];
    data: any;
    monitorAgentCallback: () => void;
    onBackPressed: () => void;
    monitoredAgent: IMonitorMenuInfo;
    loggedInAgentId: string;
    digitalAgentEnabled: boolean;
    showTableConfig: () => void;
}

type noop = (a?: any, b?: any) => {};

export interface IMonitorMenuInfo {
    monitoredAgentId: string;
    uii: string;
}
export interface IActiveInteraction {
    channelType: IChatType;
    sourceColor: IChatSourceColor;
    sourceName?: string;
}
export interface IInteraction {
    sourceType: IChatType;
    count: number;
    sourceId?: string;
    sourceColor?: IChatSourceColor;
    sourceName?: string;
}
export type ISupervisorAgentListItem = {
    glId: string;
    agentId: string;
    fullName: string;
    agentState: string;
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
    disabledTooltip?: string;
    isHidden?: boolean | undefined;
    engagements?: any;
    agentStateLabel?: any;
    originalAgentBaseState?: string;
    originalAgentStateLabel?: string;
};

export interface IInteractionHeader {
    onBackClick: () => void;
    engagedAgent: any;
}

export interface IMonitorDialog {
    onConfirm: () => void;
    onCancel: () => void;
    onCloseModal: () => void;
    title: string;
    agent?: string;
    customer?: string;
    open: boolean;
}
export interface IHoldObj {
    customer: boolean;
    agents: {
        [key: string]: boolean;
    };
}
