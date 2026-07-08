import type { FC } from 'react';

import { CallList } from './CallList/CallList';
import { ChatInteractionList } from './Chat/ChatInteractionList';
import { InteractionQuickActions } from './InteractionQuickActions';
import { FullCoveragePanel } from '../../layout/Chat/ChatList/ChatList.styled';
import type { IChatList } from '../../layout/Chat/ChatList/types/ChatList';

type InteractionListAngularDeps = IChatList & {
    $rootScope: any;
    AnalyticsSvc: any;
    SessionSvc: any;
    JupiterService: any;
    AGENT_EVENTS: any;
    CallSvc: any;
    CallPreviewSvc: any;
    CALL_EVENTS: any;
    countdown: number;
};

export const InteractionList: FC<InteractionListAngularDeps> = (props) => {
    const {
        $state,
        $rootScope,
        AnalyticsSvc,
        SessionSvc,
        JupiterService,
        AGENT_EVENTS,
        CallSvc,
        CallPreviewSvc,
        CALL_EVENTS,
        AgentSvc,
        countdown,
        ...chatListProps
    } = props;

    return (
        <FullCoveragePanel>
            <div className='shrink-0'>
                <InteractionQuickActions
                    variant='list'
                    AnalyticsSvc={AnalyticsSvc}
                    AgentSvc={AgentSvc}
                    SessionSvc={SessionSvc}
                    chatSvc={chatListProps.chatSvc}
                    JupiterService={JupiterService}
                    $rootScope={$rootScope}
                    AGENT_EVENTS={AGENT_EVENTS}
                />
            </div>
            <div className='min-h-0 flex-1 shrink-0 space-y-3 overflow-y-auto p-3 pt-0'>
                <CallList
                    CallSvc={CallSvc}
                    JupiterService={JupiterService}
                    CallPreviewSvc={CallPreviewSvc}
                    SessionSvc={SessionSvc}
                    AgentSvc={AgentSvc}
                    $state={$state}
                    $rootScope={$rootScope}
                    CALL_EVENTS={CALL_EVENTS}
                    countdown={countdown}
                />
                <ChatInteractionList
                    AgentSvc={AgentSvc}
                    $state={$state}
                    {...chatListProps}
                />
            </div>
        </FullCoveragePanel>
    );
};
