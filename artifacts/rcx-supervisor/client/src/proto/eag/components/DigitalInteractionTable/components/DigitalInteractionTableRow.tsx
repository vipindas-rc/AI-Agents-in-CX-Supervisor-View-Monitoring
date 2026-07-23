import type { FC } from 'react';
import { Fragment, useMemo, useState } from 'react';

import { CategoriesCell } from './CategoriesCell';
import { ScoreIndicator } from './ScoreIndicator';
import type { AIFeature } from '../../../common/services/transport/aiFeatures';
import { INTERACTION_SOURCES } from '../../../constants/app';
import { INTERACTION_CELL } from '../../../constants/testIds';
import { getSourceType } from '../../../containers/Chat/TypeIcon';
import InformationMenu from '../../../containers/SupervisorAgentList/components/Menus/InformationMenu';
import { SourceTypeIcon } from '../../../containers/SupervisorAgentList/components/SourceTypeIcon';
import { SUPERVISOR_INTERACTION_COLUMN_ID } from '../../../containers/SupervisorAgentList/constants';
import {
    AgentTypeTag,
    SupervisorListHoverMenu,
    SupervisorRowWrapper,
    InformationHoverMenu,
    StyledSupervisorCellWrapper,
} from '../../../containers/SupervisorAgentList/SupervisorAgentList.styled';
import type {
    IMonitorMenuInfo,
    ISupervisorTableCol,
} from '../../../containers/SupervisorAgentList/types/SupervisorAgentList';
import { hhMmSsFilterFromMs } from '../../../helpers/timeUtils';
import {
    filterNullValue,
    filterStrNullValue,
    filterTime,
} from '../../../helpers/utils';
import { getDigitalInteractionHoveredItems } from '../utils/DigitalInteractionRowRenderUtil';

export const DigitalInteractionTableRow: FC<{
    columns: any;
    data: any;
    monitorAgentCallback: () => void;
    monitoredAgent: IMonitorMenuInfo;
    viewInsight: (agentId: string, uii: string) => void;
    loggedInAgentId: string;
    digitalAgentEnabled: boolean;
    shouldShowViewInsightsButton: boolean;
    aiNotesFeatures: AIFeature[];
    isAIFeaturesEnabled: boolean;
    highlightAgentId?: string | null;
    highlightNonce?: number;
    selectedEngagementId?: string | null;
}> = ({
    data: {
        engagementSource,
        perspectiveRecordingMode,
        isLegacyChat,
        sourceName,
        productName,
        agentDurationMs,
        contactIdentity,
        threadTitle,
        pendingDispositionMs,
        fullName,
        agentType,
        engagementId,
        agentId,
        showBargeIn,
        showMonitor,
        showCoach,
        showViewInsights,
        monitorDisabledTooltip,
        bargeInDisabledTooltip,
        coachDisabledTooltip,
        productId,
        categoryIds,
        confidenceScore,
        sentimentScore,
    },
    loggedInAgentId,
    columns,
    monitorAgentCallback,
    monitoredAgent,
    viewInsight,
    digitalAgentEnabled,
    shouldShowViewInsightsButton,
    aiNotesFeatures,
    isAIFeaturesEnabled,
    highlightAgentId,
    highlightNonce,
    selectedEngagementId,
}) => {
    const [isInfoToolTipVisible, setIsInfoToolTipVisible] =
        useState<boolean>(false);

    // Rows whose agent matches the one whose "Active interactions" icons were
    // clicked on the Agents tab blink to signal they are the selected set.
    const isHighlighted = !!highlightAgentId && agentId === highlightAgentId;

    // The interaction whose AI Insights panel is open is kept visually selected
    // (steady blue/grey tint) for as long as the panel is showing.
    const isSelected =
        !!selectedEngagementId && engagementId === selectedEngagementId;

    const interactionSourceType = getSourceType(
        engagementSource.initialEngagementSourceType
    );

    const isVoiceInteraction =
        interactionSourceType === INTERACTION_SOURCES.VOICE;
    const showInformationIcon =
        !digitalAgentEnabled && !isVoiceInteraction && !isLegacyChat;
    // AI insights are available for every conversation now — voice, digital,
    // and legacy chat alike — regardless of recording mode, legacy-chat
    // status, or per-queue AI-feature flags. The only remaining gate is the
    // page-level toggle (shouldShowViewInsightsButton) and the per-row
    // showViewInsights flag (used below to enable/disable the icon itself).
    const showSupervisorAssist = shouldShowViewInsightsButton;

    // Clicking anywhere on the row opens the AI Insights pane, but only for
    // rows where the hover "AI insights" action is available and enabled —
    // the row click must never bypass that gating.
    const canOpenInsights = showSupervisorAssist && showViewInsights;

    const supervisorRowHoverItems = useMemo(
        () =>
            getDigitalInteractionHoveredItems({
                interactionSourceType: interactionSourceType,
                monitorVoice: monitorAgentCallback,
                monitoredAgent: monitoredAgent,
                viewInsight,
                agentId: agentId,
                uii: engagementId,
                showBargeIn,
                showMonitor,
                showCoach,
                showViewInsights,
                showSupervisorAssist,
                monitorDisabledTooltip,
                bargeInDisabledTooltip,
                coachDisabledTooltip,
            }),
        [
            interactionSourceType,
            monitorAgentCallback,
            monitoredAgent,
            viewInsight,
            agentId,
            engagementId,
            showBargeIn,
            showMonitor,
            showCoach,
            showViewInsights,
            showSupervisorAssist,
            monitorDisabledTooltip,
            bargeInDisabledTooltip,
            coachDisabledTooltip,
        ]
    );

    const isSelfAgent = loggedInAgentId === agentId;
    // Matches the Agents-tab row highlight rule: a row is "currently
    // monitoring" only when it is the specific interaction the supervisor
    // opened monitoring for (agent + engagement both match). The highlight is
    // driven by the monitored engagement (monitoredAgent.uii), not by the
    // per-row icon visibility flags — digital rows can have Monitor disabled
    // (voice-only gating for human agents) without reading as monitored.
    const isCurrentlyMonitoring =
        !!monitoredAgent?.monitoredAgentId &&
        monitoredAgent.monitoredAgentId === agentId &&
        !!monitoredAgent?.uii &&
        monitoredAgent.uii === engagementId &&
        !isSelfAgent;

    const getColumnValue = useMemo(
        () => (columnName: string) => {
            switch (columnName) {
                case SUPERVISOR_INTERACTION_COLUMN_ID.FULL_NAME:
                    return filterStrNullValue(fullName);
                case SUPERVISOR_INTERACTION_COLUMN_ID.AGENT_DURATION_MS:
                    return filterTime(
                        hhMmSsFilterFromMs(filterNullValue(agentDurationMs))
                    );
                case SUPERVISOR_INTERACTION_COLUMN_ID.PRODUCT_NAME:
                    return filterStrNullValue(productName);
                case SUPERVISOR_INTERACTION_COLUMN_ID.CONTACT_IDENTITY:
                    return filterStrNullValue(contactIdentity);
                case SUPERVISOR_INTERACTION_COLUMN_ID.THREAD_TITLE:
                    return filterStrNullValue(threadTitle);
                case SUPERVISOR_INTERACTION_COLUMN_ID.PENDING_DISPOSITION_MS:
                    return filterTime(
                        hhMmSsFilterFromMs(
                            filterNullValue(pendingDispositionMs)
                        )
                    );
                default:
                    return '-';
            }
        },
        [
            fullName,
            agentDurationMs,
            productName,
            contactIdentity,
            threadTitle,
            pendingDispositionMs,
        ]
    );

    return (
        <Fragment>
            <SupervisorRowWrapper
                key={isHighlighted ? `hl-${highlightNonce ?? 0}` : 'row'}
                isCurrentlyMonitoring={isCurrentlyMonitoring}
                isInfoToolTipVisible={isInfoToolTipVisible}
                isHighlighted={isHighlighted}
                isSelected={isSelected}
                onClick={
                    canOpenInsights
                        ? () => viewInsight(agentId, engagementId)
                        : undefined
                }
                style={canOpenInsights ? { cursor: 'pointer' } : undefined}
            >
                <SourceTypeIcon
                    channelType={engagementSource.initialEngagementSourceType}
                    source={filterStrNullValue(sourceName)}
                    sourceColor={engagementSource.initialEngagementSourceColor}
                    role='gridcell'
                ></SourceTypeIcon>
                {columns.map((column: ISupervisorTableCol) => {
                    if (column.hiddenColumn) {
                        return true;
                    }
                    if (
                        !column?.visible ||
                        column?.id ===
                            SUPERVISOR_INTERACTION_COLUMN_ID.SOURCE_NAME
                    ) {
                        return null;
                    }

                    if (
                        column.id ===
                        SUPERVISOR_INTERACTION_COLUMN_ID.CATEGORIES
                    ) {
                        return (
                            <CategoriesCell
                                key={column.id}
                                categoryIds={categoryIds}
                            />
                        );
                    }

                    if (
                        column.id ===
                        SUPERVISOR_INTERACTION_COLUMN_ID.AGENT_TYPE
                    ) {
                        return (
                            <StyledSupervisorCellWrapper
                                data-aid={INTERACTION_CELL}
                                key={column.id}
                                role='gridcell'
                            >
                                <AgentTypeTag
                                    variant={
                                        agentType === 'Air' ? 'air' : 'human'
                                    }
                                >
                                    {agentType === 'Air' ? 'AirPro' : 'Human'}
                                </AgentTypeTag>
                            </StyledSupervisorCellWrapper>
                        );
                    }

                    if (
                        column.id ===
                        SUPERVISOR_INTERACTION_COLUMN_ID.CONFIDENCE_SCORE
                    ) {
                        return (
                            <StyledSupervisorCellWrapper
                                data-aid={INTERACTION_CELL}
                                key={column.id}
                                role='gridcell'
                            >
                                <ScoreIndicator
                                    kind='confidence'
                                    score={confidenceScore}
                                />
                            </StyledSupervisorCellWrapper>
                        );
                    }

                    if (
                        column.id ===
                        SUPERVISOR_INTERACTION_COLUMN_ID.SENTIMENT_SCORE
                    ) {
                        return (
                            <StyledSupervisorCellWrapper
                                data-aid={INTERACTION_CELL}
                                key={column.id}
                                role='gridcell'
                            >
                                <ScoreIndicator
                                    kind='sentiment'
                                    score={sentimentScore}
                                />
                            </StyledSupervisorCellWrapper>
                        );
                    }

                    return (
                        <StyledSupervisorCellWrapper
                            data-aid={INTERACTION_CELL}
                            key={column.id}
                            role='gridcell'
                        >
                            {getColumnValue(column.id)}
                        </StyledSupervisorCellWrapper>
                    );
                })}
            </SupervisorRowWrapper>

            {showInformationIcon ? (
                <InformationHoverMenu
                    isInfoToolTipVisible={isInfoToolTipVisible}
                >
                    <StyledSupervisorCellWrapper>
                        {
                            <InformationMenu
                                setIsInfoToolTipVisible={
                                    setIsInfoToolTipVisible
                                }
                            />
                        }
                    </StyledSupervisorCellWrapper>
                </InformationHoverMenu>
            ) : (
                <SupervisorListHoverMenu role='gridcell'>
                    <StyledSupervisorCellWrapper>
                        {supervisorRowHoverItems}
                    </StyledSupervisorCellWrapper>
                </SupervisorListHoverMenu>
            )}
        </Fragment>
    );
};
