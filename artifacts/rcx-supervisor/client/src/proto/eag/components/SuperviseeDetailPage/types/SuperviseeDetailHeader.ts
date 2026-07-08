import type { ContentHeaderType } from '@ringcx/ui';

export interface ISuperviseeDetailHeader extends ContentHeaderType {
    agents: Array<{
        id: string;
        displayName: string;
    }>;
    selectedAgentOffline: boolean;
    onLogoutAgent: () => void;
}
