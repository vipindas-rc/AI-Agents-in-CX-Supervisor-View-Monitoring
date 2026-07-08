import type { FC } from 'react';
import { useEffect } from 'react';

import { WatchVideo } from '@ringcentral/juno-icon';
import { Tooltip } from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { StyledIconButton, StyledRcIcon } from './Menus.styled';
import { cxaoClient } from '../../../../common/services/LiveMonitoringAgentService/lib/CxaoClient/CxaoClient';
import { SupervisorDataId } from '../../../../constants/testIds';
import injector from '../../../../helpers/injector';
import { useBehaviorSubject } from '../../../../helpers/useBehaviorSubject';
import type { MonitorVoiceAction } from '../../types/SupervisorAgentList';

export interface LiveMonitoringMenuProps {
    fullName: string;
    rcUserId: string;
    agentId: string;
    uii: string;
    monitorVoice: MonitorVoiceAction;
    showMonitor: boolean;
}

export const LiveMonitoringMenu: FC<LiveMonitoringMenuProps> = ({
    fullName,
    rcUserId,
    agentId,
    uii,
    monitorVoice,
    showMonitor,
}) => {
    const { t } = useTranslation();

    const isMonitoredAgent = useBehaviorSubject(
        cxaoClient.$monitoredAgents
    ).has(agentId);

    const LiveMonitoringSupervisorSvc = injector('LiveMonitoringSupervisorSvc');
    const enabled = useBehaviorSubject(LiveMonitoringSupervisorSvc.$enabled);
    const player = LiveMonitoringSupervisorSvc.getPlayer(agentId);

    useEffect(() => {
        player?.$audioAvailable.next(showMonitor);
    }, [player, showMonitor]);

    if (!enabled || !isMonitoredAgent) {
        return null;
    }

    const tooltip = t('LIVE_MONITORING.SUPERVISOR.BUTTON.TOOLTIP');

    const handleClick = () => {
        if (player) {
            player.focus();
            return;
        }
        const newPlayer = LiveMonitoringSupervisorSvc.createPlayer({
            fullName,
            rcUserId,
            agentId,
            uii,
            monitorVoice,
        });
        newPlayer.$audioAvailable.next(showMonitor);
    };

    return (
        <Tooltip title={tooltip} placement='left'>
            <StyledIconButton
                size='medium'
                data-aid={SupervisorDataId.LIVE_MONITORING_BUTTON}
                aria-label={tooltip}
                onClick={handleClick}
            >
                <StyledRcIcon symbol={WatchVideo} />
            </StyledIconButton>
        </Tooltip>
    );
};
