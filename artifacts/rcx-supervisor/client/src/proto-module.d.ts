declare module "@proto" {
  import type { ComponentType } from "react";
  export interface ProtoAgentTablePanelProps {
    activeTab?: "Agents" | "Interactions";
    searchValue?: string;
    selectedStates?: string[];
    selectedChannels?: string[];
    selectedAgentGroups?: string[];
    agentTypeFilter?: "All" | "Air" | "Human";
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
  }
  const AgentTablePanel: ComponentType<ProtoAgentTablePanelProps>;
  export default AgentTablePanel;
  export const agentColumnMeta: { id: string; label: string }[];
  export const interactionColumnMeta: { id: string; label: string }[];
  export const agentStateOptions: Record<"All" | "Air" | "Human", string[]>;
  export const agentFilterOptions: { value: string; label: string }[];
}
