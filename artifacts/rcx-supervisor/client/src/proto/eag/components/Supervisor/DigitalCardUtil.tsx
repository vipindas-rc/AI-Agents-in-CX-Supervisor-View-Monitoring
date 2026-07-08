import {
    DigitalMonitorButton,
    DigitalMonitorButtonContainer,
} from './Supervisor.styled';
import { INTERACTION_SOURCES, MONITOR_TYPES } from '../../constants/app';
import { SupervisorDataId } from '../../constants/testIds';
import { getSourceType, sourceTypeMap } from '../../containers/Chat/TypeIcon';
import type { IMonitorMenuInfo } from '../../containers/SupervisorAgentList/types/SupervisorAgentList';
import { _getMonitorHoveredMenu } from '../../containers/SupervisorAgentList/utils/SupervisorRowRenderUtil';
import translate from '../../helpers/translate';
import {
    _getCoachHoveredMenu,
    _getBargeInHoveredMenu,
} from '../DigitalInteractionTable/utils/DigitalInteractionRowRenderUtil';
interface IGetDigitalInteractionHoveredItems {
    agentId: string;
    monitoredAgent: IMonitorMenuInfo;
    monitorVoice: (
        id?: string,
        type?: string,
        uii?: string,
        sourceType?: string
    ) => void;
    interactionSourceType: string;
    uii: string;
    showCoach: boolean;
    showBargeIn: boolean;
    showMonitor: boolean;
    monitorDisabledTooltip?: string;
    bargeInDisabledTooltip?: string;
    coachDisabledTooltip?: string;
    disabledTooltipPlacement?: 'left' | 'bottom';
}
export const getDigitalInteractionItems = (
    props: IGetDigitalInteractionHoveredItems
) => {
    const {
        agentId,
        monitoredAgent,
        monitorVoice,
        interactionSourceType,
        uii,
        showBargeIn,
        showMonitor,
        showCoach,
        monitorDisabledTooltip,
        bargeInDisabledTooltip,
        coachDisabledTooltip,
        disabledTooltipPlacement = 'left',
    } = props;
    const sourceType = getSourceType(interactionSourceType);
    if (
        Object.prototype.hasOwnProperty.call(
            sourceTypeMap,
            interactionSourceType
        )
    ) {
        if (interactionSourceType === INTERACTION_SOURCES.VOICE) {
            return (
                <DigitalMonitorButtonContainer>
                    <DigitalMonitorButton
                        disabled={!showMonitor}
                        data-aid={SupervisorDataId.MONITOR_BUTTON}
                    >
                        {_getMonitorHoveredMenu({
                            monitorVoice: monitorVoice,
                            agentId,
                            monitoredAgent,
                            showMonitor,
                            uii: monitoredAgent.uii,
                            disabledTooltip: monitorDisabledTooltip,
                            disabledTooltipPlacement,
                        })}
                        <span
                            onClick={() =>
                                showMonitor &&
                                monitorVoice(
                                    agentId,
                                    MONITOR_TYPES.MONITOR,
                                    uii,
                                    sourceType
                                )
                            }
                        >
                            {translate('MONITORING.TOOL_TIP.MONITOR')}
                        </span>
                    </DigitalMonitorButton>
                    <DigitalMonitorButton
                        disabled={!showCoach}
                        data-aid={SupervisorDataId.COACH_BUTTON}
                    >
                        {_getCoachHoveredMenu({
                            monitorVoice,
                            agentId,
                            monitoredAgent,
                            uii,
                            interactionSourceType,
                            showCoach,
                            disabledTooltip: coachDisabledTooltip,
                            disabledTooltipPlacement,
                        })}
                        <span
                            onClick={() =>
                                showCoach &&
                                monitorVoice(
                                    agentId,
                                    MONITOR_TYPES.COACH,
                                    uii,
                                    sourceType
                                )
                            }
                        >
                            {translate('MONITORING.TOOL_TIP.COACH')}
                        </span>
                    </DigitalMonitorButton>
                    <DigitalMonitorButton
                        disabled={!showBargeIn}
                        data-aid={SupervisorDataId.BARGE_BUTTON}
                    >
                        {_getBargeInHoveredMenu({
                            monitorVoice,
                            agentId,
                            monitoredAgent,
                            uii,
                            interactionSourceType,
                            showBargeIn,
                            disabledTooltip: bargeInDisabledTooltip,
                            disabledTooltipPlacement,
                        })}
                        <span
                            onClick={() =>
                                showBargeIn &&
                                monitorVoice(
                                    agentId,
                                    MONITOR_TYPES.BARGE_IN,
                                    uii,
                                    sourceType
                                )
                            }
                        >
                            {translate('MONITORING.TOOL_TIP.BARGE_IN')}
                        </span>
                    </DigitalMonitorButton>
                </DigitalMonitorButtonContainer>
            );
        } else {
            return (
                <DigitalMonitorButtonContainer>
                    <DigitalMonitorButton
                        disabled={!showBargeIn}
                        data-aid={SupervisorDataId.MONITOR_BUTTON}
                    >
                        {_getBargeInHoveredMenu({
                            monitorVoice,
                            agentId,
                            monitoredAgent,
                            uii,
                            interactionSourceType,
                            showBargeIn,
                            disabledTooltip: bargeInDisabledTooltip,
                            disabledTooltipPlacement,
                        })}
                        <span
                            onClick={() =>
                                showBargeIn &&
                                monitorVoice(
                                    agentId,
                                    MONITOR_TYPES.BARGE_IN,
                                    uii,
                                    sourceType
                                )
                            }
                        >
                            {translate('MONITORING.TOOL_TIP.BARGE_IN')}
                        </span>
                    </DigitalMonitorButton>
                </DigitalMonitorButtonContainer>
            );
        }
    }
    return [];
};
