import { AGENT_PRESENCE } from '../constants/AgentPresence';

export function getAgentPresenceClass(agentPresenceStatus: string) {
    const lowerCaseStatus = agentPresenceStatus?.toLowerCase();
    switch (lowerCaseStatus) {
        case AGENT_PRESENCE.AVAILABLE:
            return 'available';
        case AGENT_PRESENCE.OFFLINE:
            return 'offline';
        case AGENT_PRESENCE.BUSY:
            return 'busy';
        default:
            return '';
    }
}
