import { useEffect, useRef } from 'react';

import { useAngularModule } from './useAngularModule';
import { StartRenderType, CRMPlatform } from '../../../constants/crm';

type ScriptData = {
    scriptId?: string;
    data?: any;
};

type CurrentCall = {
    agentSessionId?: string;
    script?: ScriptData;
    scriptId?: string;
    type?: string;
    uii?: string;
    lead?: {
        leadId?: string;
    };
};

const INTERACTION_PREVIEW = 'INTERACTION-PREVIEW';

const getCallRenderKey = (call: CurrentCall) =>
    [call.uii, call.script?.scriptId ?? call.scriptId]
        .filter(Boolean)
        .join(':');

export function useRenderScript(
    currentCall: CurrentCall,
    isMatched?: boolean,
    platform?: CRMPlatform
) {
    const CrmSvc = useAngularModule('CrmSvc');
    const ScriptSvc = useAngularModule('ScriptSvc');
    // for Salesforce, it need to render script after finish contact match.
    // for other CRMs, it could render script immediately.
    const isRenderScriptImmediately = platform !== CRMPlatform.Salesforce;
    const renderedCallKeyRef = useRef<string | null>(null);

    const { agentSessionId, type, uii } = currentCall;
    const scriptUrl = CrmSvc.integrateInfo?.scriptUrl;
    const renderKey = getCallRenderKey(currentCall);

    useEffect(() => {
        if (
            !(type === INTERACTION_PREVIEW || agentSessionId) ||
            (!isRenderScriptImmediately && !isMatched)
        ) {
            return;
        }

        if (!CrmSvc.currentCallHasScript(currentCall)) {
            return;
        }

        const runCheckAndRender = (call: CurrentCall) => {
            if (!renderKey || renderedCallKeyRef.current === renderKey) {
                return;
            }
            CrmSvc.checkAndResetScript(call);
            const enableSummary = CrmSvc.hasAISummaryInScript(call);
            CrmSvc.startRender({
                type: StartRenderType.SCRIPT,
                url: scriptUrl,
                renderId: CrmSvc.getScriptRenderId(call),
                params: {
                    scriptId: call.script?.scriptId,
                    uii: call.uii,
                    enableSummary,
                    type: call.type,
                },
            });
            renderedCallKeyRef.current = renderKey;
        };

        runCheckAndRender(currentCall);
    }, [
        currentCall,
        agentSessionId,
        CrmSvc,
        ScriptSvc,
        isMatched,
        isRenderScriptImmediately,
        renderKey,
        scriptUrl,
        type,
        uii,
    ]);

    useEffect(() => {
        if (!renderKey || renderedCallKeyRef.current !== renderKey) {
            renderedCallKeyRef.current = null;
        }
    }, [renderKey]);
}
