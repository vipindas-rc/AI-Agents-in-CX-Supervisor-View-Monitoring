import { useCallback, forwardRef } from 'react';

import { RcIcon } from '@ringcentral/juno';
import { WhisperSp } from '@ringcentral/juno-icon';
import { Tooltip } from '@ringcx/ui';

import { StyledIconButton } from './Menus.styled';
import { INTERACTION_SOURCES, MONITOR_TYPES } from '../../../../constants/app';
import translate from '../../../../helpers/translate';
import { getSourceType } from '../../../Chat/TypeIcon';
import type { IMonitorMenuInfo } from '../../types/SupervisorAgentList';

const CoachMenu = forwardRef<
    HTMLButtonElement,
    {
        monitorVoice: (
            agentId: string,
            monitorType: MONITOR_TYPES,
            uii: string,
            sourceType: string
        ) => void;
        agentId: string;
        monitoredAgent: IMonitorMenuInfo;
        showCoach: boolean;
        interactionSourceType: string;
        disabledTooltip?: string;
        disabledTooltipPlacement?: 'left' | 'bottom';
    }
>(
    (
        {
            monitorVoice,
            agentId,
            monitoredAgent,
            showCoach,
            interactionSourceType,
            disabledTooltip,
            disabledTooltipPlacement = 'left',
        },
        ref
    ) => {
        const { uii } = monitoredAgent;
        const sourceType = getSourceType(interactionSourceType);
        //only show disabled tooltip if the coach is disabled by Previewing state
        const showDisabledTooltip = !showCoach && disabledTooltip;
        const toolTipText = showDisabledTooltip
            ? disabledTooltip
            : sourceType === INTERACTION_SOURCES.LEGACY
              ? translate('MONITORING.TOOL_TIP.COACH_TEXT')
              : translate('MONITORING.TOOL_TIP.COACH');
        const monitorAgentVoice = useCallback(() => {
            monitorVoice(agentId, MONITOR_TYPES.COACH, uii, sourceType);
        }, [agentId, sourceType, monitorVoice, uii]);

        const button = (
            <StyledIconButton
                {...{
                    ref,
                    onClick: monitorAgentVoice,
                    disabled: !showCoach,
                    'aria-label': toolTipText,
                }}
            >
                <RcIcon size={'medium'} symbol={WhisperSp} />
            </StyledIconButton>
        );

        if (showDisabledTooltip) {
            return (
                <Tooltip
                    title={toolTipText}
                    placement={disabledTooltipPlacement}
                >
                    <span style={{ display: 'inline-flex' }}>{button}</span>
                </Tooltip>
            );
        }

        return (
            <Tooltip title={toolTipText} placement='left'>
                {button}
            </Tooltip>
        );
    }
);
CoachMenu.displayName = 'CoachMenu';
export default CoachMenu;
