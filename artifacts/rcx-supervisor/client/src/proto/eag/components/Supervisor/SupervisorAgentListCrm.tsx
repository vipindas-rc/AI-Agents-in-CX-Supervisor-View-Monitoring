import { useEffect, type FC, useState } from 'react';

import { AgentCard } from './AgentCard';
import { AgentCardDetails } from './AgentCardDetails';
import { MonitorDialog } from './MonitorDialog';
import { SupervisorCardContainer } from './Supervisor.styled';
import type {
    ISupervisorAgentList,
    ISupervisorAgentListItem,
} from './types/Supervisor';
import type { MONITOR_TYPES } from '../../constants/app';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import translate from '../../helpers/translate';

export const SupervisorAgentListCrm: FC<ISupervisorAgentList> = ({
    agentList,
    filterColumns,
    loggedInAgentId,
    onLogOut,
    monitorAgentCallback,
    monitoredAgent,
    selectedStates,
    selectedChannels,
    searchValue,
    setIsSelectedInCrm,
    showTableConfig,
    Dialog,
    AgentSvc,
}) => {
    const [filterAgentList, setFilterAgentList] =
        useState<ISupervisorAgentListItem[]>(agentList);
    const [selectedAgent, setSelectedAgent] =
        useState<ISupervisorAgentListItem | null>(null);
    const [isSelected, setIsSelected] = useState<boolean>(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [selectedAgentForMonitor, setSelectedAgentForMonitor] = useState<{
        agentName: string;
        customer: string;
    } | null>(null);
    const [monitoredDetails, setMonitoredDetails] = useState<{
        agentId: string;
        type: MONITOR_TYPES;
        uii: string;
        sourceType: string;
    }>({
        agentId: '',
        type: 'monitor' as MONITOR_TYPES.MONITOR,
        uii: '',
        sourceType: '',
    });

    useEffect(() => {
        let filterAgent = [...agentList];
        if (selectedStates.length > 0) {
            filterAgent = filterAgent.filter((list) => {
                return (
                    list.agentState.toLowerCase() ===
                    selectedStates[0].toLowerCase()
                );
            });
        }
        if (selectedChannels.length > 0) {
            filterAgent = filterAgent.filter((list) =>
                list.activeInteractions.some((interactions) =>
                    selectedChannels.includes(interactions.sourceName || '')
                )
            );
        }
        if (searchValue) {
            filterAgent = filterAgent.filter((list) => {
                return (
                    list.fullName
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    list.agentState
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                );
            });
        }

        setFilterAgentList(filterAgent);
    }, [searchValue, agentList, selectedStates, selectedChannels]);

    const onAgentSelect = (agentId: string) => {
        const filterAgent = agentList.filter((list) => {
            return list.agentId === agentId;
        });

        setSelectedAgent(filterAgent[0]);
        setIsSelected(true);
        setIsSelectedInCrm(true);
    };

    useEffect(() => {
        const agentId = selectedAgent?.agentId;
        if (agentId) {
            const filterAgent = agentList.filter((list) => {
                return list.agentId === agentId;
            });
            setSelectedAgent(filterAgent[0]);
            setIsSelected(!!filterAgent[0]);
            setIsSelectedInCrm(!!filterAgent[0]);
        }
    }, [agentList]);

    const onBackPressed = () => {
        setSelectedAgent(null);
        setIsSelected(false);
        setIsSelectedInCrm(false);
    };

    const onMonitorCB = (
        agentId: string,
        type: MONITOR_TYPES,
        uii: string,
        sourceType: string
    ) => {
        const filterAgent = agentList.filter((list) => {
            return list.agentId === agentId;
        });
        const currentAgent = filterAgent[0];
        const engagements = currentAgent.engagements;
        const voiceEngagement = engagements.filter(
            (item: {
                engagementSource: { initialEngagementSourceType: string };
            }) => {
                return (
                    item?.engagementSource?.initialEngagementSourceType ===
                    'VOICE'
                );
            }
        );
        const customerDetails = voiceEngagement?.[0]?.contactIdentity;

        setSelectedAgentForMonitor({
            agentName: currentAgent.fullName,
            customer: customerDetails,
        });
        setIsModalOpen(true);
        setMonitoredDetails({ agentId, type, uii, sourceType });
        return {};
    };

    const onCloseModal = () => {
        setIsModalOpen(false);
    };

    return (
        <SupervisorCardContainer isSelected={isSelected}>
            {!isSelected &&
                filterAgentList?.map((list) => {
                    return (
                        <AgentCard
                            key={`card_${list.agentId}`}
                            data={list}
                            loggedInAgentId={loggedInAgentId}
                            monitorAgentCallback={onMonitorCB}
                            monitoredAgent={monitoredAgent}
                            onAgentSelect={onAgentSelect}
                            AgentSvc={AgentSvc}
                        />
                    );
                })}
            {!isSelected && filterAgentList.length <= 0 && (
                <div className='no-result'>
                    {translate('DASHBOARD.AGENTS.GRID.NO_AGENTS_MSG')}
                </div>
            )}
            {isSelected && selectedAgent?.agentId && (
                <AgentCardDetails
                    showTableConfig={showTableConfig}
                    loggedInAgentId={loggedInAgentId}
                    filterColumns={filterColumns}
                    data={selectedAgent}
                    onLogOut={onLogOut}
                    monitorAgentCallback={onMonitorCB}
                    monitoredAgent={monitoredAgent}
                    onBackPressed={onBackPressed}
                    Dialog={Dialog}
                    AgentSvc={AgentSvc}
                />
            )}
            <MonitorDialog
                onConfirm={() => {
                    monitorAgentCallback(
                        monitoredDetails.agentId,
                        monitoredDetails.type,
                        monitoredDetails.uii,
                        monitoredDetails.sourceType
                    );
                    onCloseModal();
                }}
                onCancel={onCloseModal}
                onCloseModal={onCloseModal}
                title={translate('SUPERVISOR.MODAL.START_MONITORING')}
                agent={selectedAgentForMonitor?.agentName}
                customer={selectedAgentForMonitor?.customer}
                open={isModalOpen}
            />
        </SupervisorCardContainer>
    );
};

export default CreateAngularModule(
    'supervisorAgentListCrm',
    SupervisorAgentListCrm,
    [
        'agentList',
        'filterColumns',
        'loggedInAgentId',
        'onLogOut',
        'monitorAgentCallback',
        'monitoredAgent',
        'selectedStates',
        'selectedChannels',
        'searchValue',
        'onInteractionRollupClick',
        'setIsSelectedInCrm',
        'showTableConfig',
    ],
    ['Dialog', 'AgentSvc']
);
