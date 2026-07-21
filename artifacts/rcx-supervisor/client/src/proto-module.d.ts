declare module "@proto" {
  import type { ComponentType } from "react";
  export interface ProtoAgentTablePanelProps {
    activeTab?: "Agents" | "Interactions";
    searchValue?: string;
    selectedStates?: string[];
    selectedChannels?: string[];
    selectedAgentGroups?: string[];
    agentTypeFilter?: string[];
    statusFilter?: "All" | "Active" | "Inactive";
    visibleColumnIds?: string[];
    selectedAgentIds?: string[];
    selectedCategories?: string[];
    visibleInteractionColumnIds?: string[];
    onActiveInteractionsClick?: (agentId: string) => void;
    highlightAgentId?: string | null;
    highlightNonce?: number;
    // Digital "Interaction preview" (URL-driven by the page).
    previewEngagementId?: string | null;
    previewMode?: "preview" | "expanded" | "takeover" | null;
    onPreviewOpen?: (engagementId: string) => void;
    onPreviewModeChange?: (mode: "preview" | "expanded" | "takeover") => void;
    onPreviewClose?: () => void;
    // Voice take-over committed — page switches to the Active calls context.
    onTakeOverCommitted?: (agentId: string) => void;
    // Floating call window closed — page leaves the Active calls context
    // if it was showing this agent's taken-over call.
    onMonitoringWindowClosed?: (agentId: string) => void;
  }
  const AgentTablePanel: ComponentType<ProtoAgentTablePanelProps>;
  export default AgentTablePanel;
  export const agentColumnMeta: { id: string; label: string }[];
  export const interactionColumnMeta: { id: string; label: string }[];
  export const agentStateOptions: Record<"All" | "Air" | "Human", string[]>;
  export const agentFilterOptions: { value: string; label: string }[];

  export interface SupervisorFilterOption {
    value: string;
    label: string;
  }
  export interface SupervisorFilterProps {
    values: string[];
    onValuesChange: (values: string[]) => void;
    placeholder: string;
    options: SupervisorFilterOption[];
    testId?: string;
    ariaLabel?: string;
  }
  export const SupervisorFilter: ComponentType<SupervisorFilterProps>;

  export interface ActiveCallViewProps {
    agentId?: string | null;
  }
  export const ActiveCallView: ComponentType<ActiveCallViewProps>;
}
