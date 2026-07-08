import { useState, useRef, useEffect } from 'react';

import { TEST_AID } from '@ringcx/ui';

import { getAgentAssistMessageManagerFactory } from '../../../common/services/AIIframeService/messaging/agentAssistMessaging';
import { AGENT_ASSIST } from '../../../constants/testIds';
import { CustomerInformationStyled as IframeWrapper } from '../customerInformation/CustomerInformation.styled';
import type { ICustomerInformation } from '../customerInformation/types/CustomerInformation';

interface AgentAssistProps extends ICustomerInformation {
    isPanelOpen: boolean;
}

export const AgentAssist = ({
    id,
    loadFrame,
    isPanelOpen,
}: AgentAssistProps) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const frameContainerRef = useRef<HTMLDivElement>(null);
    const tabContentContainerRef = useRef<HTMLDivElement | null>(null);
    const agentAssistMessageManagerFactoryRef = useRef(
        getAgentAssistMessageManagerFactory(id)
    );

    const [hasOpened, setHasOpened] = useState(false);

    if (hasOpened && !isLoaded) {
        agentAssistMessageManagerFactoryRef.current.triggerAISuggestion();
        loadFrame(id);
        setIsLoaded(true);
    }

    useEffect(() => {
        const frameContainer = frameContainerRef.current!;
        const tabContentContainer = frameContainer.closest(
            `[data-aid=${TEST_AID.TAB_CONTAINER}]`
        ) as HTMLDivElement;
        if (!tabContentContainer) {
            return;
        }
        const observer = new MutationObserver((entries) => {
            const element = entries[0].target as HTMLDivElement;
            if (element?.style?.display === 'block') {
                setHasOpened(true);
                observer.disconnect();
            }
        });
        tabContentContainerRef.current = tabContentContainer;
        // when render in tabs and tab is not active, we need to observe the tab element
        if (tabContentContainer.style?.display === 'none') {
            observer.observe(tabContentContainer, { attributes: true });
        }

        return () => {
            observer.disconnect();
        };
    }, []);

    useEffect(() => {
        const tabContentContainer = tabContentContainerRef.current;

        // when Agent Assist not render in tabs or tab is active, trigger actions
        if (
            !tabContentContainer ||
            tabContentContainer.style?.display === 'block'
        ) {
            setHasOpened((hasOpened) => hasOpened || isPanelOpen);
        }
    }, [isPanelOpen]);

    return (
        <IframeWrapper>
            <div id={id} data-aid={AGENT_ASSIST} ref={frameContainerRef}></div>
        </IframeWrapper>
    );
};
