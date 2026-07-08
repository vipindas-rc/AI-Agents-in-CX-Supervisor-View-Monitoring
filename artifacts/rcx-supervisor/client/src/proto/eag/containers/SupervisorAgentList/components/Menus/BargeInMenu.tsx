import { useCallback, forwardRef } from 'react';

import { RcIcon } from '@ringcentral/juno';
import { BargeSp } from '@ringcentral/juno-icon';
import { Tooltip } from '@ringcx/ui';

import { StyledIconButton } from './Menus.styled';
import { MONITOR_TYPES } from '../../../../constants/app';
import translate from '../../../../helpers/translate';
import { getSourceType } from '../../../Chat/TypeIcon';
import type { IMonitorMenuInfo } from '../../types/SupervisorAgentList';

const BargeInMenu = forwardRef<
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
        interactionSourceType: string;
        showBargeIn: boolean;
        disabledTooltip?: string;
        disabledTooltipPlacement?: 'left' | 'bottom';
    }
>(
    (
        {
            monitorVoice,
            agentId,
            monitoredAgent,
            interactionSourceType,
            showBargeIn,
            disabledTooltip,
            disabledTooltipPlacement = 'left',
        },
        ref
    ) => {
        const { uii } = monitoredAgent;
        const sourceType = getSourceType(interactionSourceType);
        //only show disabled tooltip if the barge in is disabled by Previewing state
        const showDisabledTooltip = !showBargeIn && disabledTooltip;
        const toolTipText = showDisabledTooltip
            ? disabledTooltip
            : translate('MONITORING.TOOL_TIP.BARGE_IN');
        const monitorAgentVoice = useCallback(() => {
            monitorVoice(agentId, MONITOR_TYPES.BARGE_IN, uii, sourceType);
        }, [agentId, sourceType, monitorVoice, uii]);

        const button = (
            <StyledIconButton
                {...{
                    ref,
                    onClick: monitorAgentVoice,
                    disabled: !showBargeIn,
                    'aria-label': toolTipText,
                }}
            >
                <RcIcon size={'medium'} symbol={BargeSp} />
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
BargeInMenu.displayName = 'BargeInMenu';
export default BargeInMenu;
