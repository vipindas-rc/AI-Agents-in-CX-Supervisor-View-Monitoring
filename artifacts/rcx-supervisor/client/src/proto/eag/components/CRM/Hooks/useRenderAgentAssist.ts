import { useEffect } from 'react';

import { useAngularModule } from './useAngularModule';

export function useRenderAgentAssist(
    currentCall: any,
    enableAgentAssist: boolean
) {
    const CrmSvc = useAngularModule('CrmSvc');

    useEffect(() => {
        if (currentCall.agentSessionId && enableAgentAssist) {
            CrmSvc.renderAgentAssist(true);
        }
    }, [currentCall.agentSessionId, CrmSvc, enableAgentAssist]);
}
