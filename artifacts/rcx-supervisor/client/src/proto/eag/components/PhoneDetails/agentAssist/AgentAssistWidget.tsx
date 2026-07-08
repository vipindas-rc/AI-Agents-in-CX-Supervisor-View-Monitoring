import { useState, useEffect, useRef } from 'react';

import { getAgentAssistMessageManagerFactory } from '../../../common/services/AIIframeService/messaging/agentAssistMessaging';
import { AGENT_ASSIST } from '../../../constants/testIds';

type AgentAssistWidgetProps = {
    id: string;
    visible: boolean;
    loadFrame: any;
};

export const AgentAssistWidget = ({
    id,
    loadFrame,
    visible,
}: AgentAssistWidgetProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const agentAssistMessageManagerFactoryRef = useRef(
        getAgentAssistMessageManagerFactory(id)
    );

    useEffect(() => {
        if (visible && !isLoaded) {
            agentAssistMessageManagerFactoryRef.current.triggerAISuggestion();
            loadFrame(id);
            setIsLoaded(true);
        }
    }, [visible, isLoaded, id, loadFrame]);

    return <div id={id} data-aid={AGENT_ASSIST} />;
};
