import { useCallback, type FC, useState } from 'react';

import { LeftChevron, TextEclipse } from '@ringcx/ui';
import { toUpper } from 'lodash';

import { useAgentStateHook } from './AgentStateHooks';
import { AgentStatusContainer } from './AgentStatusContainer';
import { BREAK_AFTER_CALL, TRANSITION, PREVIEWING } from './Constants';
import { SwitchMenu } from './MonitorSwitchMenu';
import {
    StyledAgentDetails,
    AgentPreview,
    AgentMonitor,
    AgentMonitorButton,
    StyledGridListLink,
    AgentNameContainor,
    IconButton,
} from './Supervisor.styled';
import type { ISupervisorAgentListRowDetails } from './types/Supervisor';
import { INTERACTION_SOURCES, MONITOR_TYPES } from '../../constants/app';
import { SupervisorDataId } from '../../constants/testIds';
import { ActiveInteractions } from '../../containers/SupervisorAgentList/components/ActiveInteractions';
import { SourceTypeIcon } from '../../containers/SupervisorAgentList/components/SourceTypeIcon';
import { SUPERVISOR_AGENT_COLUMN_ID } from '../../containers/SupervisorAgentList/constants';
import {
    getAgentStateWithColor,
    _getMonitorHoveredMenu,
} from '../../containers/SupervisorAgentList/utils/SupervisorRowRenderUtil';
import { agentStateColor } from '../../helpers/agentState';
import { hhMmSsFilterFromMs } from '../../helpers/timeUtils';
import translate from '../../helpers/translate';
import {
    filterNullValue,
    filterTime,
    toPercentWithDecimal,
    filterStrNullValue,
} from '../../helpers/utils';

export const AgentCardDetails: FC<ISupervisorAgentListRowDetails> = ({
    data,
    monitorAgentCallback,
    loggedInAgentId,
    monitoredAgent,
    filterColumns,
    onBackPressed,
    Dialog,
    AgentSvc,
}) => {
    const {
        agentId,
        fullName,
        agentState,
        stateDuration,
        pendingDispTime,
        activeInteractions,
        longestEngagement,
        longestActiveInteraction,
        interactions24hRollupTotalCount,
        talkTime,
        averageTimePerCall,
        skill,
        login,
        utilization,
        agentBaseState,
        showMonitor,
        disabledTooltip,
        originalAgentBaseState,
        originalAgentStateLabel,
    } = data;
    const [isOpen, setIsOpen] = useState(false);
    const stateColor = agentStateColor(toUpper(agentBaseState));
    const [currentAgentStateList] = useAgentStateHook({ data, AgentSvc });
    const isChangeAgentStateDisabled =
        agentBaseState === BREAK_AFTER_CALL ||
        agentBaseState === TRANSITION ||
        agentBaseState === PREVIEWING;
    const noShowFields = [
        SUPERVISOR_AGENT_COLUMN_ID.FULL_NAME,
        SUPERVISOR_AGENT_COLUMN_ID.AGENT_STATE,
    ];
    const logoutAgent = useCallback((agentId: string) => {
        Dialog.confirm(
            null,
            null,
            'AGENT_MONITOR.ACTIONS.LOGOUT.CONFIRM',
            'GENERICS.ACTIONS.YES',
            'GENERICS.ACTIONS.NO'
        ).then(function () {
            AgentSvc.logoutAgent(agentId);
            onBackPressed?.();
        });
    }, []);
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
            case SUPERVISOR_AGENT_COLUMN_ID.PENDING_DISPOSITION_TIME:
                return filterTime(
                    hhMmSsFilterFromMs(filterNullValue(pendingDispTime))
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
            case SUPERVISOR_AGENT_COLUMN_ID.LONGEST_ACTIVE_INTERACTION:
                return (
                    <SourceTypeIcon
                        channelType={longestEngagement.sourceType}
                        source={filterTime(
                            hhMmSsFilterFromMs(
                                filterNullValue(longestActiveInteraction)
                            )
                        )}
                        sourceColor={longestEngagement.sourceColor}
                    ></SourceTypeIcon>
                );

            case SUPERVISOR_AGENT_COLUMN_ID.INTERACTIONS_ROLLUP:
                return filterNullValue(interactions24hRollupTotalCount) !==
                    '—' ? (
                    <StyledGridListLink showAsLink={true} onClick={() => {}}>
                        {filterNullValue(interactions24hRollupTotalCount)}
                    </StyledGridListLink>
                ) : (
                    <StyledGridListLink>
                        {filterNullValue(interactions24hRollupTotalCount)}
                    </StyledGridListLink>
                );
            case SUPERVISOR_AGENT_COLUMN_ID.TALK_TIME:
                return filterTime(
                    hhMmSsFilterFromMs(filterNullValue(talkTime))
                );
            case SUPERVISOR_AGENT_COLUMN_ID.AVERAGE_TIME_PER_CALL:
                return filterTime(
                    hhMmSsFilterFromMs(filterNullValue(averageTimePerCall))
                );
            case SUPERVISOR_AGENT_COLUMN_ID.LOGIN:
                return filterTime(hhMmSsFilterFromMs(filterNullValue(login)));
            case SUPERVISOR_AGENT_COLUMN_ID.SKILL:
                return filterStrNullValue(skill);
            case SUPERVISOR_AGENT_COLUMN_ID.UTILIZATION:
                return toPercentWithDecimal(filterNullValue(utilization), 2);
            default:
                return '-';
        }
    };

    const handleClickHandler = useCallback(() => {
        monitorAgentCallback(
            agentId,
            MONITOR_TYPES.MONITOR,
            monitoredAgent.uii,
            INTERACTION_SOURCES.VOICE
        );
    }, []);

    const createOptions = [
        {
            id: '1',
            title: translate('MONITORING.AGENT_OPTIONS.LOGOUT'),
            action: () => {
                logoutAgent(agentId);
            },
            isDisabled: loggedInAgentId === agentId,
            className: 'logout-agent',
        },
    ];
    return (
        <StyledAgentDetails>
            <AgentNameContainor data-aid={SupervisorDataId.AGENT_LIST_DETAILS}>
                <IconButton onClick={onBackPressed} aria-label='back'>
                    <LeftChevron />
                </IconButton>
                <span className='agent-text'>
                    <TextEclipse
                        tooltipMsg={getColumnValue(
                            SUPERVISOR_AGENT_COLUMN_ID.FULL_NAME
                        )}
                    >
                        {getColumnValue(SUPERVISOR_AGENT_COLUMN_ID.FULL_NAME)}
                    </TextEclipse>
                </span>
                <span>
                    <SwitchMenu
                        data-aid={SupervisorDataId.LOGOUT_MENU}
                        shouldHide={false}
                        options={createOptions}
                    />
                </span>
            </AgentNameContainor>
            <AgentMonitor>
                <AgentMonitorButton
                    data-aid={SupervisorDataId.AGENT_MONITOR_BUTTON}
                    onClick={showMonitor ? handleClickHandler : undefined}
                    disabled={!showMonitor}
                >
                    {_getMonitorHoveredMenu({
                        monitorVoice: monitorAgentCallback,
                        agentId,
                        monitoredAgent,
                        showMonitor,
                        uii: monitoredAgent.uii,
                        disabledTooltip,
                        disabledTooltipPlacement: 'bottom',
                    })}
                    <span>{translate('MONITORING.TOOL_TIP.MONITOR')}</span>
                </AgentMonitorButton>
            </AgentMonitor>
            <AgentPreview
                key={`agent_preview_${SUPERVISOR_AGENT_COLUMN_ID.AGENT_STATE}`}
            >
                <span className='agent-text'>
                    {translate('DASHBOARD.AGENTS.GRID.STATE.STATE')}
                </span>
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
            </AgentPreview>

            {filterColumns?.map((column) => {
                if (column.visible && !noShowFields.includes(column.id)) {
                    return (
                        <AgentPreview
                            data-aid={`${SupervisorDataId.AGENT_LIST_ITEM}_${column.id}`}
                            key={`agent_preview_${column.id}`}
                        >
                            <span className='agent-text'>
                                {translate(column.translationPath || '')}
                            </span>
                            <span className='agent-text'>
                                {getColumnValue(column.id)}
                            </span>
                        </AgentPreview>
                    );
                }
            })}
        </StyledAgentDetails>
    );
};
