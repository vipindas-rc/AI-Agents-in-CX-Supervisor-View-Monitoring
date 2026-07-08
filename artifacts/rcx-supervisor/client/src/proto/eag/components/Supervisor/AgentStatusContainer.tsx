import { type FC, useState, useCallback } from 'react';

import { toUpper } from 'lodash';

import AgentStates from './AgentStates';
import { StatusColor, StyledDropdownIcon } from './Supervisor.styled';
import type { IAgentStatusContainer } from './types/Supervisor';

export const AgentStatusContainer: FC<IAgentStatusContainer> = ({
    isChangeAgentStateDisabled,
    isCurrentAgent,
    stateColor,
    agentState,
    currentAgentStateList,
    AgentSvc,
    agentId,
    agentBaseState,
    currentAgentState,
    currentAgentAuxState,
}) => {
    const [isAgentState, setIsAgentState] = useState(false);
    const agentStatusValue = useCallback(() => {
        return (
            <div className={'agent-text-wrapper'}>
                <StatusColor color={stateColor} />
                <span>{toUpper(agentState)}</span>
                {!isCurrentAgent && (
                    <span className='agent-text-dropdown'>
                        <StyledDropdownIcon isActive={isAgentState} />
                    </span>
                )}
            </div>
        );
    }, [agentState, isAgentState]);
    return (
        <AgentStates
            AgentSvc={AgentSvc}
            currentAgentStateList={currentAgentStateList}
            agentStatusValue={agentStatusValue}
            setIsAgentState={setIsAgentState}
            isCurrentAgent={isCurrentAgent}
            isChangeAgentStateDisabled={isChangeAgentStateDisabled}
            agentBaseState={agentState}
            agentId={agentId}
            currentAgentAuxState={currentAgentAuxState}
            currentAgentState={currentAgentState}
        />
    );
};
