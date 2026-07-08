import type { FC, MouseEvent, KeyboardEvent } from 'react';
import { Fragment, useCallback, useMemo } from 'react';

import { isActivationKey, TextEclipse } from '@ringcx/ui';
import { t } from 'i18next';

import { ActiveInteractions } from './ActiveInteractions';
import { SourceTypeIcon } from './SourceTypeIcon';
import { INTERACTIONS_ROLLUP_LINK } from '../../../constants/testIds';
import { hhMmSsFilterFromMs } from '../../../helpers/timeUtils';
import {
    filterNullValue,
    filterTime,
    toPercentWithDecimal,
    filterStrNullValue,
} from '../../../helpers/utils';
import { SUPERVISOR_AGENT_COLUMN_ID } from '../constants';
import {
    AgentTypeTag,
    StyledAgentNameCellWrapper,
    StyledGridListLink,
    StyledSupervisorCellWrapper,
    SupervisorListHoverMenu,
    SupervisorRowWrapper,
} from '../SupervisorAgentList.styled';
import type {
    ISupervisorAgentListRow,
    ISupervisorTableCol,
} from '../types/SupervisorAgentList';
import {
    getAgentStateWithColor,
    getHoveredItems,
} from '../utils/SupervisorRowRenderUtil';

const SupervisorRowRenderer: FC<ISupervisorAgentListRow> = ({
    data,
    columns,
    onInteractionsClick,
    loggedInAgentId,
    onLogOut,
    changeAgentState,
    monitorAgentCallback,
    monitoredAgent,
    onInteractionRollupClick,
    isChangeAgentStateAvailable,
}) => {
    const {
        agentId,
        rcUserId,
        fullName,
        agentState,
        agentType,
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
        showLogout,
        showChangeState,
        disabledTooltip,
    } = data;

    const onClickInteraction = useCallback(
        (event: MouseEvent) => {
            onInteractionsClick(event, agentId);
        },
        [agentId, onInteractionsClick]
    );
    const onClickInteractionRollup = useCallback(
        (event: MouseEvent | KeyboardEvent<HTMLSpanElement>) => {
            onInteractionRollupClick(event, agentId);
        },
        [agentId, onInteractionRollupClick]
    );
    const handleKeyDownInteractionRollup = useCallback(
        (event: KeyboardEvent<HTMLSpanElement>) => {
            if (isActivationKey(event.key)) {
                event.preventDefault();
                event.stopPropagation();
                onClickInteractionRollup(event);
            }
        },
        [onClickInteractionRollup]
    );
    const supervisorRowHoverItems = useMemo(
        () =>
            getHoveredItems({
                onLogOut,
                changeAgentState,
                agentBaseState,
                agentState,
                agentId,
                rcUserId,
                monitorVoice: monitorAgentCallback,
                monitoredAgent,
                showMonitor,
                showLogout,
                showChangeState,
                isChangeAgentStateAvailable,
                disabledTooltip,
                fullName,
            }),
        [
            agentId,
            rcUserId,
            monitorAgentCallback,
            monitoredAgent,
            onLogOut,
            changeAgentState,
            showMonitor,
            showLogout,
            showChangeState,
            agentBaseState,
            agentState,
            isChangeAgentStateAvailable,
            disabledTooltip,
            fullName,
        ]
    );

    const isSelfAgent = loggedInAgentId === agentId;
    const isCurrentlyMonitoring = !showMonitor && !isSelfAgent;

    const getColumnValue = (column: ISupervisorTableCol) => {
        switch (column.id) {
            case SUPERVISOR_AGENT_COLUMN_ID.FULL_NAME: {
                const displayName = filterStrNullValue(fullName);
                return (
                    <TextEclipse tooltipMsg={displayName}>
                        {displayName}
                    </TextEclipse>
                );
            }
            case SUPERVISOR_AGENT_COLUMN_ID.AGENT_STATE:
                return getAgentStateWithColor(agentState, agentBaseState);
            case SUPERVISOR_AGENT_COLUMN_ID.AGENT_TYPE:
                return (
                    <AgentTypeTag
                        variant={agentType === 'Air' ? 'air' : 'human'}
                    >
                        {agentType === 'Air' ? 'AirPro' : 'Human'}
                    </AgentTypeTag>
                );
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
                            onClickInteraction,
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
                    <StyledGridListLink
                        showAsLink={true}
                        onClick={onClickInteractionRollup}
                        data-aid={INTERACTIONS_ROLLUP_LINK}
                        role='button'
                        tabIndex={0}
                        onKeyDown={handleKeyDownInteractionRollup}
                        aria-label={t(
                            'GENERICS.MODAL.SUPERVISOR_STATINTERACTION_ROLLUP'
                        )}
                    >
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

    return (
        <Fragment>
            <SupervisorRowWrapper isCurrentlyMonitoring={isCurrentlyMonitoring}>
                {columns.map((column) => {
                    if (column.hiddenColumn) {
                        return;
                    }
                    return (
                        column?.visible &&
                        (column.id === SUPERVISOR_AGENT_COLUMN_ID.FULL_NAME ? (
                            <StyledAgentNameCellWrapper
                                key={column.id}
                                role='gridcell'
                            >
                                {getColumnValue(column)}
                            </StyledAgentNameCellWrapper>
                        ) : (
                            <StyledSupervisorCellWrapper
                                key={column.id}
                                role='gridcell'
                            >
                                {getColumnValue(column)}
                            </StyledSupervisorCellWrapper>
                        ))
                    );
                })}
            </SupervisorRowWrapper>
            <SupervisorListHoverMenu role='gridcell'>
                <StyledSupervisorCellWrapper>
                    {supervisorRowHoverItems}
                </StyledSupervisorCellWrapper>
            </SupervisorListHoverMenu>
        </Fragment>
    );
};

export default SupervisorRowRenderer;
