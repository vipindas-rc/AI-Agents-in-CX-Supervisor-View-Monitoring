import { INTERACTION_SOURCES } from '../../../constants/app';
import { sourceTypeMap } from '../../../containers/Chat/TypeIcon';
import BargeInMenu from '../../../containers/SupervisorAgentList/components/Menus/BargeInMenu';
import CoachMenu from '../../../containers/SupervisorAgentList/components/Menus/CoachMenu';
import ViewInsightsMenu from '../../../containers/SupervisorAgentList/components/Menus/ViewInsightsMenu';
import type { IMonitorMenuInfo } from '../../../containers/SupervisorAgentList/types/SupervisorAgentList';
import { _getMonitorHoveredMenu } from '../../../containers/SupervisorAgentList/utils/SupervisorRowRenderUtil';

interface IGetDigitalInteractionHoveredItems {
    agentId: string;
    monitoredAgent: IMonitorMenuInfo;
    monitorVoice: () => void;
    viewInsight: (agentId: string, uii: string) => void;
    interactionSourceType: string;
    uii: string;
    showCoach: boolean;
    showBargeIn: boolean;
    showMonitor: boolean;
    showViewInsights: boolean;
    showSupervisorAssist: boolean;
    monitorDisabledTooltip?: string;
    bargeInDisabledTooltip?: string;
    coachDisabledTooltip?: string;
    disabledTooltipPlacement?: 'left' | 'bottom';
}

export const getDigitalInteractionHoveredItems = (
    props: IGetDigitalInteractionHoveredItems
) => {
    const {
        agentId,
        monitoredAgent,
        monitorVoice,
        viewInsight,
        interactionSourceType,
        uii,
        showBargeIn,
        showMonitor,
        showCoach,
        showViewInsights,
        showSupervisorAssist,
        monitorDisabledTooltip,
        bargeInDisabledTooltip,
        coachDisabledTooltip,
        disabledTooltipPlacement,
    } = props;

    if (
        Object.prototype.hasOwnProperty.call(
            sourceTypeMap,
            interactionSourceType
        )
    ) {
        if (interactionSourceType === INTERACTION_SOURCES.VOICE) {
            return [
                _getSupervisorAssistHoveredMenu({
                    agentId,
                    showSupervisorAssist,
                    viewInsight,
                    showViewInsights,
                    uii,
                }),
                _getMonitorHoveredMenu({
                    monitorVoice,
                    agentId,
                    monitoredAgent,
                    showMonitor,
                    uii,
                    disabledTooltip: monitorDisabledTooltip,
                    disabledTooltipPlacement,
                }),
                _getCoachHoveredMenu({
                    monitorVoice,
                    agentId,
                    monitoredAgent,
                    uii,
                    interactionSourceType,
                    showCoach,
                    disabledTooltip: coachDisabledTooltip,
                    disabledTooltipPlacement,
                }),
                _getBargeInHoveredMenu({
                    monitorVoice,
                    agentId,
                    monitoredAgent,
                    uii,
                    interactionSourceType,
                    showBargeIn,
                    disabledTooltip: bargeInDisabledTooltip,
                    disabledTooltipPlacement,
                }),
            ];
        } else {
            // Digital rows show exactly two hover actions: Monitor and Barge.
            // "Join" is voice/legacy-conferencing-specific and is not offered
            // here.
            return [
                _getSupervisorAssistHoveredMenu({
                    agentId,
                    showSupervisorAssist,
                    viewInsight,
                    showViewInsights,
                    uii,
                }),
                _getMonitorHoveredMenu({
                    monitorVoice,
                    agentId,
                    monitoredAgent,
                    showMonitor,
                    uii,
                    disabledTooltip: monitorDisabledTooltip,
                    disabledTooltipPlacement,
                }),
                _getBargeInHoveredMenu({
                    monitorVoice,
                    agentId,
                    monitoredAgent,
                    uii,
                    interactionSourceType,
                    showBargeIn,
                    disabledTooltip: bargeInDisabledTooltip,
                    disabledTooltipPlacement,
                }),
            ];
        }
    }
    return [];
};

export const _getSupervisorAssistHoveredMenu = ({
    agentId,
    viewInsight,
    showSupervisorAssist,
    showViewInsights,
    uii,
}: {
    agentId: string;
    viewInsight: (agentId: string, uii: string) => void;
    showSupervisorAssist: boolean;
    showViewInsights: boolean;
    uii: string;
}) => {
    if (!showSupervisorAssist) {
        return null;
    }

    return (
        <ViewInsightsMenu
            key={`insights_${agentId}_${uii}`}
            {...{
                agentId,
                viewInsight,
                showViewInsights,
                uii,
            }}
        />
    );
};

export const _getCoachHoveredMenu = ({
    monitorVoice,
    agentId,
    monitoredAgent,
    uii,
    interactionSourceType,
    showCoach,
    disabledTooltip,
    disabledTooltipPlacement,
}: {
    monitorVoice: () => void;
    agentId: string;
    monitoredAgent: IMonitorMenuInfo;
    uii: string;
    interactionSourceType: string;
    showCoach: boolean;
    disabledTooltip?: string;
    disabledTooltipPlacement?: 'left' | 'bottom';
}) => {
    monitoredAgent = { ...monitoredAgent, uii: uii };
    return (
        <CoachMenu
            key={`coach_${agentId}_${uii}`}
            {...{
                monitorVoice: monitorVoice,
                agentId: agentId,
                monitoredAgent: monitoredAgent,
                interactionSourceType,
                showCoach,
                disabledTooltip,
                disabledTooltipPlacement,
            }}
        />
    );
};
export const _getBargeInHoveredMenu = ({
    monitorVoice,
    agentId,
    monitoredAgent,
    uii,
    interactionSourceType,
    showBargeIn,
    disabledTooltip,
    disabledTooltipPlacement,
}: {
    monitorVoice: () => void;
    agentId: string;
    monitoredAgent: IMonitorMenuInfo;
    uii: string;
    interactionSourceType: string;
    showBargeIn: boolean;
    disabledTooltip?: string;
    disabledTooltipPlacement?: 'left' | 'bottom';
}) => {
    monitoredAgent = { ...monitoredAgent, uii: uii };
    return (
        <BargeInMenu
            key={`barge_${agentId}_${uii}`}
            {...{
                monitorVoice: monitorVoice,
                agentId: agentId,
                monitoredAgent: monitoredAgent,
                interactionSourceType,
                showBargeIn,
                disabledTooltip,
                disabledTooltipPlacement,
            }}
        />
    );
};
