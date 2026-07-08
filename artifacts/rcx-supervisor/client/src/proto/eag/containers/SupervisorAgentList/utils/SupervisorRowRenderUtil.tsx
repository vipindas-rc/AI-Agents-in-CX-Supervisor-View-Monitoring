import { TextEclipse } from '@ringcx/ui';
import { toUpper } from 'lodash';

import type { MONITOR_TYPES } from '../../../constants/app';
import { CSS_CLASS_TYPES } from '../../../constants/app';
import { agentStateColor } from '../../../helpers/agentState';
import { LiveMonitoringMenu } from '../components/Menus/LiveMonitoringMenu';
import MonitorMenu from '../components/Menus/MonitorMenu';
import { MoreMenu } from '../components/Menus/MoreMenu';
import {
    ShowState,
    SupervisorStateColor,
    SupervisorStateText,
} from '../SupervisorAgentList.styled';
import type {
    IGetHoveredItems,
    IMonitorMenuInfo,
    MonitorVoiceAction,
} from '../types/SupervisorAgentList';

export const getHoveredItems = (props: IGetHoveredItems) => {
    const {
        onLogOut,
        changeAgentState,
        agentBaseState,
        agentState,
        agentId,
        rcUserId,
        monitorVoice,
        monitoredAgent,
        showMonitor,
        showLogout,
        showChangeState,
        isChangeAgentStateAvailable,
        disabledTooltip,
        fullName,
    } = props;

    return [
        _getMonitorHoveredMenu({
            monitorVoice,
            agentId,
            monitoredAgent,
            showMonitor,
            uii: monitoredAgent.uii,
            disabledTooltip,
        }),
        _getLiveMonitoringHoveredMenu({
            fullName,
            rcUserId,
            agentId,
            uii: monitoredAgent.uii,
            showMonitor,
            monitorVoice,
        }),
        _getMoreHoveredMenu(
            onLogOut,
            changeAgentState,
            agentBaseState,
            agentState,
            agentId,
            showLogout,
            showChangeState,
            isChangeAgentStateAvailable
        ),
    ];
};

const _getMoreHoveredMenu = (
    onLogOut: (agentId: string) => void,
    changeAgentState: (agentId: string) => void,
    agentBaseState: string,
    agentState: string,
    agentId: string,
    showLogout: boolean,
    showChangeState: boolean,
    isChangeAgentStateAvailable: boolean
) => {
    return (
        <MoreMenu
            key={`more_${agentId}`}
            {...{
                onLogOut,
                changeAgentState,
                agentBaseState,
                agentState,
                agentId,
                showLogout,
                showChangeState,
                isChangeAgentStateAvailable,
            }}
        />
    );
};

export const _getMonitorHoveredMenu = ({
    monitorVoice,
    agentId,
    monitoredAgent,
    showMonitor,
    uii,
    disabledTooltip,
    disabledTooltipPlacement,
}: {
    monitorVoice: (
        agentId: string,
        monitorType: MONITOR_TYPES,
        uii: string,
        sourceType: string
    ) => void;
    agentId: string;
    monitoredAgent: IMonitorMenuInfo;
    showMonitor: boolean;
    uii: string;
    disabledTooltip?: string;
    disabledTooltipPlacement?: 'left' | 'bottom';
}) => {
    monitoredAgent = { ...monitoredAgent, uii: uii };
    return (
        <MonitorMenu
            key={`monitor_${agentId}_${uii || 'default'}`}
            {...{
                monitorVoice: monitorVoice,
                agentId: agentId,
                monitoredAgent: monitoredAgent,
                showMonitor,
                disabledTooltip,
                disabledTooltipPlacement,
            }}
        />
    );
};
export const getAgentStateWithColor = (
    agentState: string,
    currentAgentBaseState: string
) => {
    const stateColor = agentStateColor(toUpper(currentAgentBaseState));
    const stateText = agentState.toUpperCase();
    return (
        <ShowState>
            <SupervisorStateColor
                {...{
                    stateColor: stateColor,
                }}
            />

            <SupervisorStateText>
                <TextEclipse tooltipMsg={stateText}>{stateText}</TextEclipse>
            </SupervisorStateText>
        </ShowState>
    );
};

export const getSelfAgentProps = (
    loggedInAgentId: string,
    monitoringEnabled: boolean,
    agentId: string,
    showLogout: boolean | undefined
) => {
    const isSelfAgent =
        loggedInAgentId === agentId ||
        (showLogout !== undefined && !showLogout);
    const isSelfAgentClassname = isSelfAgent
        ? CSS_CLASS_TYPES.DESELECTED
        : CSS_CLASS_TYPES.EMPTY;
    const monitorEnabledClass = !monitoringEnabled
        ? CSS_CLASS_TYPES.DISABLED
        : CSS_CLASS_TYPES.EMPTY;
    return {
        monitorEnabledClass,
        isSelfAgent,
        isSelfAgentClassname,
    };
};

export interface GetLiveMonitoringHoveredMenuParams {
    fullName: string;
    rcUserId: string;
    agentId: string;
    uii: string;
    monitorVoice: MonitorVoiceAction;
    showMonitor: boolean;
}

export const _getLiveMonitoringHoveredMenu = ({
    fullName,
    rcUserId,
    agentId,
    uii,
    monitorVoice,
    showMonitor,
}: GetLiveMonitoringHoveredMenuParams) => {
    return (
        <LiveMonitoringMenu
            key='liveMonitoring'
            fullName={fullName}
            rcUserId={rcUserId}
            agentId={agentId}
            uii={uii}
            monitorVoice={monitorVoice}
            showMonitor={showMonitor}
        />
    );
};
