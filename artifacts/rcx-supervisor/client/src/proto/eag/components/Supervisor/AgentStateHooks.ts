import { useState, useEffect } from 'react';

import { DEFAULT_AGENT_STATE, ENGAGED } from './Constants';
import type { ICurrentAgentState } from './types/Supervisor';

export const useAgentStateHook: ({
    data,
    AgentSvc,
}: {
    data: any;
    AgentSvc: any;
}) => ICurrentAgentState[][] = ({ data, AgentSvc }) => {
    const { agentBaseState, agentStateLabel } = data;
    const [currentAgentState, setCurrentAgentState] = useState('');
    const [currentAgentStateList, setCurrentAgentStateList] = useState<
        ICurrentAgentState[]
    >([]);

    useEffect(() => {
        const agentState =
            agentStateLabel === '' ? agentBaseState : agentStateLabel;
        if (agentState !== currentAgentState) {
            setCurrentAgentState(agentState);
        }
        let agentStateList = getAvailableAgentStates();
        agentStateList =
            AgentSvc.getAgentStatesWithTranslatedLabels(agentStateList);
        setCurrentAgentStateList(agentStateList);
    }, [data]);
    const getAvailableAgentStates = () => {
        return currentAgentState === ENGAGED
            ? [
                  {
                      color: DEFAULT_AGENT_STATE.COLOR,
                      label: DEFAULT_AGENT_STATE.LABEL,
                      value: DEFAULT_AGENT_STATE.VALUE,
                  },
              ]
            : AgentSvc.getAvailableAgentStatesFromAccount().filter(
                  (state: { label: string }) =>
                      state.label !== currentAgentState
              );
    };

    return [currentAgentStateList];
};
