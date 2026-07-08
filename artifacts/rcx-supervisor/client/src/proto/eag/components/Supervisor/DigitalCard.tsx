import type { FC } from 'react';
import { useMemo } from 'react';

import { Tooltip, handleKeyboardClick } from '@ringcx/ui';

import { StyledSupervisorCard, CardTitle, CardBody } from './Supervisor.styled';
import type { ISupervisorDigitalListRow } from './types/Supervisor';
import { getDigitalInteractionHoveredItems } from '../../components/DigitalInteractionTable/utils/DigitalInteractionRowRenderUtil';
import { INTERACTION_SOURCES } from '../../constants/app';
import { SupervisorDataId } from '../../constants/testIds';
import { getSourceType } from '../../containers/Chat/TypeIcon';
import { SourceTypeIcon } from '../../containers/SupervisorAgentList/components/SourceTypeIcon';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { hhMmSsFilterFromMs } from '../../helpers/timeUtils';
import translate from '../../helpers/translate';
import {
    filterNullValue,
    filterTime,
    filterStrNullValue,
} from '../../helpers/utils';
export const DigitalCard: FC<ISupervisorDigitalListRow> = ({
    data,
    agentList,
    monitoredAgent,
    onDigitalClick,
    MonitorSvc,
    CallSvc,
    digitalTaskMonitor,
}) => {
    const {
        engagementSource,
        sourceName,
        agentDurationMs,
        fullName,
        engagementId,
        agentId,
        showBargeIn,
        showMonitor,
        showCoach,
        monitorDisabledTooltip,
        bargeInDisabledTooltip,
        coachDisabledTooltip,
    } = data;
    const interactionSourceType = getSourceType(
        engagementSource.initialEngagementSourceType
    );
    const supervisorRowHoverItems = useMemo(
        () =>
            getDigitalInteractionHoveredItems({
                interactionSourceType: interactionSourceType,
                monitorVoice: startMonitor,
                monitoredAgent: monitoredAgent,
                agentId: agentId,
                uii: engagementId,
                showBargeIn,
                showMonitor,
                showCoach,
                viewInsight: () => {},
                showViewInsights: false,
                showSupervisorAssist: false,
                monitorDisabledTooltip,
                bargeInDisabledTooltip,
                coachDisabledTooltip,
                disabledTooltipPlacement: 'bottom',
            }),
        [
            interactionSourceType,
            startMonitor,
            monitoredAgent,
            agentId,
            engagementId,
            showBargeIn,
            showMonitor,
            showCoach,
            monitorDisabledTooltip,
            bargeInDisabledTooltip,
            coachDisabledTooltip,
        ]
    );
    function startMonitor(
        agentId?: string,
        type?: string,
        uii?: string,
        sourceType?: string
    ) {
        const agent = agentList.find((agent) => agent.agentId === agentId);

        if (sourceType === INTERACTION_SOURCES.VOICE) {
            uii =
                uii === undefined ? MonitorSvc.getVoiceMonitorUii(agent) : uii;
            if (MonitorSvc.allowMonitoring(type, agentId)) {
                MonitorSvc.call.uii = uii;
                CallSvc.voiceMonitorAction(type, agent, uii);
            } else {
                CallSvc.terminateMonitorSession();
            }
        } else {
            if (agentId && uii && agent)
                digitalTaskMonitor(agentId, uii, agent);
        }
    }
    const onDigitalClickHandler = (
        event:
            | React.MouseEvent<HTMLDivElement, MouseEvent>
            | React.KeyboardEvent<Element>
    ): void => {
        const clickedElement = event.target as HTMLElement;
        if (clickedElement.tagName !== 'I') onDigitalClick(engagementId);
    };
    return (
        <StyledSupervisorCard
            isFullHeight={true}
            onClick={(e) => onDigitalClickHandler(e)}
            role='button'
            tabIndex={0}
            onKeyDown={handleKeyboardClick(onDigitalClickHandler)}
        >
            <CardTitle>
                <Tooltip
                    title={translate('SUPERVISOR.TOOLTIP.TITLE')}
                    placement={'top'}
                >
                    <span data-aid={SupervisorDataId.INTERACTION_TYPE}>
                        <SourceTypeIcon
                            {...{
                                channelType:
                                    engagementSource.initialEngagementSourceType,
                                source: filterStrNullValue(sourceName),
                                sourceColor:
                                    engagementSource.initialEngagementSourceColor,
                            }}
                        ></SourceTypeIcon>
                    </span>
                </Tooltip>
                <span data-aid={SupervisorDataId.INTERACTION_ICONS}>
                    {supervisorRowHoverItems}
                </span>
            </CardTitle>
            <Tooltip
                title={translate('SUPERVISOR.TOOLTIP.TITLE')}
                placement={'bottom'}
            >
                <CardBody>
                    <div className='digital-card-body'>
                        <span>
                            {translate(
                                'MONITORING.DIGITAL_INTERACTIONS.AGENT_COLUMN_HEADER'
                            )}
                        </span>
                        <span>{translate('AGENT_MONITOR.DURATION')}</span>
                    </div>
                    <div className='digital-card-value'>
                        <span data-aid={SupervisorDataId.AGENTNAME}>
                            <div>{filterStrNullValue(fullName)}</div>
                        </span>
                        <span data-aid={SupervisorDataId.AGENT_DURATION}>
                            {filterTime(
                                hhMmSsFilterFromMs(
                                    filterNullValue(agentDurationMs)
                                )
                            )}
                        </span>
                    </div>
                </CardBody>
            </Tooltip>
        </StyledSupervisorCard>
    );
};

export default CreateAngularModule(
    'digitalCard',
    DigitalCard,
    [],
    ['MonitorSvc', 'CallSvc']
);
