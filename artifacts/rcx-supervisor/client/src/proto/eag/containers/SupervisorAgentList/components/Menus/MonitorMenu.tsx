import { useCallback, forwardRef } from 'react';

import { MonitorCall } from '@ringcentral/juno-icon';
import { Tooltip } from '@ringcx/ui';

import { StyledIconButton, StyledRcIcon } from './Menus.styled';
import { RCX_SERVICE_SELECTED } from '../../../../constants/analyticsEvents';
import { INTERACTION_SOURCES, MONITOR_TYPES } from '../../../../constants/app';
import { SupervisorDataId } from '../../../../constants/testIds';
import injector from '../../../../helpers/injector';
import translate from '../../../../helpers/translate';
import type { IMonitorMenuInfo } from '../../types/SupervisorAgentList';

const MonitorMenu = forwardRef<
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
        showMonitor: boolean;
        disabledTooltip?: string;
        disabledTooltipPlacement?: 'left' | 'bottom';
    }
>(
    (
        {
            monitorVoice,
            agentId,
            monitoredAgent,
            showMonitor,
            disabledTooltip,
            disabledTooltipPlacement = 'left',
        },
        ref
    ) => {
        const AnalyticsSvc = injector('AnalyticsSvc');
        const { uii } = monitoredAgent;
        //only show disabled tooltip if the monitor is disabled by Previewing state
        const showDisabledTooltip = !showMonitor && disabledTooltip;
        const toolTip = showDisabledTooltip
            ? disabledTooltip
            : translate('MONITORING.TOOL_TIP.MONITOR');
        const monitorAgentVoice = useCallback(
            (e: React.MouseEvent<HTMLButtonElement>) => {
                e.stopPropagation();
                monitorVoice(
                    agentId,
                    MONITOR_TYPES.MONITOR,
                    uii,
                    INTERACTION_SOURCES.VOICE
                );
                AnalyticsSvc.track(RCX_SERVICE_SELECTED, { option: 'monitor' });
            },
            [AnalyticsSvc, agentId, monitorVoice, uii]
        );

        const button = (
            <StyledIconButton
                {...{
                    ref,
                    onClick: monitorAgentVoice,
                    size: 'medium',
                    disabled: !showMonitor,
                    'data-aid': SupervisorDataId.MONITOR_BUTTON,
                    'aria-label': toolTip,
                }}
            >
                <StyledRcIcon symbol={MonitorCall} />
            </StyledIconButton>
        );

        if (showDisabledTooltip) {
            return (
                <Tooltip title={toolTip} placement={disabledTooltipPlacement}>
                    <span style={{ display: 'inline-flex' }}>{button}</span>
                </Tooltip>
            );
        }

        return (
            <Tooltip title={toolTip} placement='left'>
                {button}
            </Tooltip>
        );
    }
);
MonitorMenu.displayName = 'MonitorMenu';
export default MonitorMenu;
