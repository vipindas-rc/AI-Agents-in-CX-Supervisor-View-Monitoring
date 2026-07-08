import { type FC } from 'react';

import { Tooltip, handleKeyboardClick } from '@ringcx/ui';
import { toUpper } from 'lodash';

import { useAgentStateHook } from './AgentStateHooks';
import { AgentStatusContainer } from './AgentStatusContainer';
import { BREAK_AFTER_CALL, PREVIEWING, TRANSITION } from './Constants';
import { StyledSupervisorCard, CardTitle, CardBody } from './Supervisor.styled';
import type { ISupervisorAgentListRow } from './types/Supervisor';
import { SupervisorDataId } from '../../constants/testIds';
import { ActiveInteractions } from '../../containers/SupervisorAgentList/components/ActiveInteractions';
import { SUPERVISOR_AGENT_COLUMN_ID } from '../../containers/SupervisorAgentList/constants';
import {
    getAgentStateWithColor,
    _getMonitorHoveredMenu,
} from '../../containers/SupervisorAgentList/utils/SupervisorRowRenderUtil';
import { agentStateColor } from '../../helpers/agentState';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { hhMmSsFilterFromMs } from '../../helpers/timeUtils';
import translate from '../../helpers/translate';
import {
    filterNullValue,
    filterTime,
    filterStrNullValue,
} from '../../helpers/utils';

export const AgentCard: FC<ISupervisorAgentListRow> = ({
    data,
    loggedInAgentId,
    monitorAgentCallback,
    monitoredAgent,
    onAgentSelect,
    AgentSvc,
}) => {
    const {
        agentId,
        fullName,
        agentState,
        stateDuration,
        activeInteractions,
        agentBaseState,
        showMonitor,
        disabledTooltip,
        originalAgentBaseState,
        originalAgentStateLabel,
    } = data;
    const isChangeAgentStateDisabled =
        agentBaseState === BREAK_AFTER_CALL ||
        agentBaseState === TRANSITION ||
        agentBaseState === PREVIEWING;
    const stateColor = agentStateColor(toUpper(agentBaseState));
    const [currentAgentStateList] = useAgentStateHook({ data, AgentSvc });
    const isSelfAgent = loggedInAgentId === agentId;

    const getColumnValue = (type: any) => {
        switch (type) {
            case SUPERVISOR_AGENT_COLUMN_ID.FULL_NAME:
                return filterStrNullValue(fullName);
            case SUPERVISOR_AGENT_COLUMN_ID.AGENT_STATE:
                return getAgentStateWithColor(agentState, agentBaseState);
            case SUPERVISOR_AGENT_COLUMN_ID.STATE_DURATION:
                return filterTime(
                    hhMmSsFilterFromMs(filterNullValue(stateDuration))
                );
            case SUPERVISOR_AGENT_COLUMN_ID.ACTIVE_INTERACTIONS:
                return (
                    <ActiveInteractions
                        {...{
                            activeInteractions,
                            onClickInteraction: () => {},
                            isSelfAgent,
                        }}
                    />
                );
            default:
                return '-';
        }
    };

    const onAgentSelectCB = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.KeyboardEvent<Element>
    ): void => {
        const clickedElement = event.target as HTMLElement;
        if (
            clickedElement.tagName !== 'I' &&
            !clickedElement.classList.contains('monitor_call')
        ) {
            onAgentSelect(agentId);
        }
    };
    const isActiveInteractions = activeInteractions.length > 0;
    return (
        <StyledSupervisorCard
            data-aid={SupervisorDataId.AGENT_CARD}
            isFullHeight={isActiveInteractions}
            onClick={(e) => onAgentSelectCB(e)}
            role='button'
            tabIndex={0}
            onKeyDown={handleKeyboardClick(onAgentSelectCB)}
        >
            <CardTitle>
                <Tooltip
                    title={translate('SUPERVISOR.TOOLTIP.TITLE')}
                    placement={'top'}
                >
                    <span>
                        {getColumnValue(SUPERVISOR_AGENT_COLUMN_ID.FULL_NAME)}
                    </span>
                </Tooltip>
                <span data-aid={SupervisorDataId.MONITOR_BUTTON_ICON}>
                    {_getMonitorHoveredMenu({
                        monitorVoice: monitorAgentCallback,
                        agentId,
                        monitoredAgent,
                        showMonitor,
                        uii: monitoredAgent.uii,
                        disabledTooltip,
                        disabledTooltipPlacement: 'bottom',
                    })}
                </span>
            </CardTitle>

            <CardBody>
                <div>
                    <AgentStatusContainer
                        isCurrentAgent={isSelfAgent}
                        isChangeAgentStateDisabled={isChangeAgentStateDisabled}
                        stateColor={stateColor}
                        agentState={agentState}
                        currentAgentStateList={currentAgentStateList}
                        agentId={agentId}
                        AgentSvc={AgentSvc}
                        agentBaseState={agentBaseState}
                        currentAgentState={originalAgentStateLabel}
                        currentAgentAuxState={originalAgentBaseState}
                    />
                    <Tooltip
                        hidden={!isActiveInteractions}
                        title={translate('SUPERVISOR.TOOLTIP.TITLE')}
                        placement={'bottom'}
                    >
                        <span className='active-interaction'>
                            {translate(
                                'DASHBOARD.AGENTS.GRID.ACTIVE_INTERACTION'
                            )}
                        </span>
                    </Tooltip>
                </div>
                <div className='agent-card-value'>
                    <Tooltip
                        title={translate('SUPERVISOR.TOOLTIP.TITLE')}
                        placement={'bottom'}
                    >
                        <span data-aid={SupervisorDataId.AGENT_STATUS}>
                            {getColumnValue(
                                SUPERVISOR_AGENT_COLUMN_ID.STATE_DURATION
                            )}
                        </span>
                    </Tooltip>
                    {isActiveInteractions && (
                        <span
                            className='card-icons'
                            data-aid={SupervisorDataId.AGENT_INTERACTIONS}
                        >
                            {getColumnValue(
                                SUPERVISOR_AGENT_COLUMN_ID.ACTIVE_INTERACTIONS
                            )}
                        </span>
                    )}
                </div>
            </CardBody>
        </StyledSupervisorCard>
    );
};

export default CreateAngularModule('agentCard', AgentCard, [], []);
