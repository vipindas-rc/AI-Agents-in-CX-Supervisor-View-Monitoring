import type { FC } from 'react';
import { useMemo } from 'react';

import { LeftChevron, Disposition, TextEclipse } from '@ringcx/ui';

import { getDigitalInteractionItems } from './DigitalCardUtil';
import {
    StyledAgentDetails,
    AgentPreview,
    AgentNameContainor,
    AgentMonitor,
    IconButton,
} from './Supervisor.styled';
import type { ISupervisorDigitalListRowDetails } from './types/Supervisor';
import { SupervisorDataId } from '../../constants/testIds';
import { getSourceType } from '../../containers/Chat/TypeIcon';
import { SourceTypeIcon } from '../../containers/SupervisorAgentList/components/SourceTypeIcon';
import { SUPERVISOR_INTERACTION_COLUMN_ID } from '../../containers/SupervisorAgentList/constants';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { hhMmSsFilterFromMs } from '../../helpers/timeUtils';
import translate from '../../helpers/translate';
import {
    filterNullValue,
    filterTime,
    filterStrNullValue,
} from '../../helpers/utils';
export const DigitalCardDetails: FC<ISupervisorDigitalListRowDetails> = ({
    data: {
        engagementSource,
        sourceName,
        productName,
        agentDurationMs,
        contactIdentity,
        threadTitle,
        pendingDispositionMs,
        fullName,
        engagementId,
        agentId,
        showBargeIn,
        showMonitor,
        showCoach,
        monitorDisabledTooltip,
        bargeInDisabledTooltip,
        coachDisabledTooltip,
    },
    monitorAgentCallback,
    monitoredAgent,
    onBackPressed,
    filterColumns,
    showTableConfig,
}) => {
    const interactionSourceType = getSourceType(
        engagementSource.initialEngagementSourceType
    );
    const supervisorRowHoverItems = useMemo(
        () =>
            getDigitalInteractionItems({
                interactionSourceType: interactionSourceType,
                monitorVoice: monitorAgentCallback,
                monitoredAgent: monitoredAgent,
                agentId: agentId,
                uii: engagementId,
                showBargeIn,
                showMonitor,
                showCoach,
                monitorDisabledTooltip,
                bargeInDisabledTooltip,
                coachDisabledTooltip,
                disabledTooltipPlacement: 'bottom',
            }),
        [
            interactionSourceType,
            monitorAgentCallback,
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

    const getColumnValue = (type: any) => {
        switch (type) {
            case SUPERVISOR_INTERACTION_COLUMN_ID.SOURCE_NAME:
                return (
                    <SourceTypeIcon
                        {...{
                            channelType:
                                engagementSource.initialEngagementSourceType,
                            source: filterStrNullValue(sourceName),
                            sourceColor:
                                engagementSource.initialEngagementSourceColor,
                        }}
                    ></SourceTypeIcon>
                );
            case SUPERVISOR_INTERACTION_COLUMN_ID.PRODUCT_NAME:
                return filterStrNullValue(productName);
            case SUPERVISOR_INTERACTION_COLUMN_ID.FULL_NAME:
                return filterStrNullValue(fullName);
            case SUPERVISOR_INTERACTION_COLUMN_ID.AGENT_DURATION_MS:
                return filterTime(
                    hhMmSsFilterFromMs(filterNullValue(agentDurationMs))
                );
            case SUPERVISOR_INTERACTION_COLUMN_ID.CONTACT_IDENTITY:
                return filterStrNullValue(contactIdentity);
            case SUPERVISOR_INTERACTION_COLUMN_ID.THREAD_TITLE:
                return filterStrNullValue(threadTitle);
            case SUPERVISOR_INTERACTION_COLUMN_ID.PENDING_DISPOSITION_MS:
                return filterTime(
                    hhMmSsFilterFromMs(filterNullValue(pendingDispositionMs))
                );
            default:
                return '-';
        }
    };

    return (
        <StyledAgentDetails>
            <AgentNameContainor>
                <IconButton
                    data-aid={SupervisorDataId.AGENT_BACK}
                    onClick={onBackPressed}
                >
                    <LeftChevron />
                </IconButton>
                <span
                    data-aid={SupervisorDataId.AGENTNAME}
                    className='agent-text'
                >
                    <TextEclipse
                        tooltipMsg={getColumnValue(
                            SUPERVISOR_INTERACTION_COLUMN_ID.FULL_NAME
                        )}
                    >
                        {getColumnValue(
                            SUPERVISOR_INTERACTION_COLUMN_ID.FULL_NAME
                        )}
                    </TextEclipse>
                </span>
                <IconButton
                    data-aid={SupervisorDataId.TABLE_SETTING}
                    onClick={showTableConfig}
                >
                    <Disposition />
                </IconButton>
            </AgentNameContainor>
            <AgentMonitor data-aid={SupervisorDataId.INTERACTION_ICONS}>
                {supervisorRowHoverItems}
            </AgentMonitor>
            {filterColumns?.map((column) => {
                if (column.visible) {
                    return (
                        <AgentPreview
                            data-aid={`${SupervisorDataId.AGENT_LIST_ITEM}_${column.id}`}
                            key={`digital_preview_${column.id}`}
                        >
                            <span className='agent-text'>
                                {translate(column.translationPath || '')}
                            </span>
                            <span>{getColumnValue(column.id)}</span>
                        </AgentPreview>
                    );
                }
            })}
        </StyledAgentDetails>
    );
};

export default CreateAngularModule(
    'digitalCardDetails',
    DigitalCardDetails,
    [],
    []
);
