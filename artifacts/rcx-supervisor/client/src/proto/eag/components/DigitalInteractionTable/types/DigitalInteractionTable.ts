import type { PropertyPath } from '@ringcx/shared';
import type { RenderSubRowData } from '@ringcx/ui';

import type { AIFeature } from '../../../common/services/transport/aiFeatures';
import type {
    IMonitorMenuInfo,
    ISupervisorTableCol,
} from '../../../containers/SupervisorAgentList/types/SupervisorAgentList';

export interface IDigitalInteractionTable {
    columns: ISupervisorTableCol[];
    digitalTaskList: InteractionData[];
    monitorAgentCallback: () => void;
    monitoredAgent: IMonitorMenuInfo;
    viewInsight: (agentId: string, uii: string) => void;
    loggedInAgentId: string;
    selectedIds: string[];
    selectedChannels: string[];
    selectedCategories: string[];
    searchValue: string;
    shouldShowViewInsightsButton: boolean;
    AgentSvc: any;
    FeatureFlagsSvc: any;
    aiNotesFeatures: AIFeature[];
    highlightAgentId?: string | null;
    highlightNonce?: number;
    selectedEngagementId?: string | null;
}
export type InteractionSearchRowsType = {
    agentId: string;
    sourceName: string;
    fullName: string;
    productName: string;
    contactIdentity: string;
    contactIdentityE164?: string;
    threadTitle: string;
    categoryIds: string;
    categoryNames?: string;
};
export const interactionAgentNameCol: PropertyPath<InteractionSearchRowsType>[] =
    [['agentId']];
export const interactionChannelNameCol: PropertyPath<InteractionSearchRowsType>[] =
    [['sourceName']];
export const interactionCategoryCol: PropertyPath<InteractionSearchRowsType>[] =
    [['categoryIds']];
export const interactionSearchColIndexes: PropertyPath<InteractionSearchRowsType>[] =
    [
        ['sourceName'],
        ['fullName'],
        ['productName'],
        ['contactIdentity'],
        ['contactIdentityE164'],
        ['threadTitle'],
        ['categoryNames'],
    ];

type EngagementSource = {
    initialEngagementSourceId: string;
    initialEngagementSourceType: string;
    initialEngagementSourceName: string;
    initialEngagementSourceColor: string;
    connections: InteractionConnections;
};
type InteractionConnections = {
    connectionId: string;
    connectionSourceType: string;
};
export type InteractionData = {
    agentId: string;
    fullName: string;
    agentType?: string;
    sourceName: string;
    isHidden?: boolean | undefined;
    glId: string;
    subRows: RenderSubRowData<InteractionSearchRowsType>[];
    engagementId: string;
    isActive: boolean;
    isLegacyChat: boolean;
    contactIdentity: string;
    threadTitle: string;
    focusedConnectionId: string;
    productId: string;
    productName: string;
    pendingDispositionMs: string;
    engagementSource: EngagementSource;
    categoryIds: string;
};
