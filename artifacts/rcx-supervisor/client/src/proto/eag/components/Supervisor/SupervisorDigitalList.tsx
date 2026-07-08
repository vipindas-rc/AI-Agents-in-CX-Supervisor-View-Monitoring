import { useEffect, type FC, useState } from 'react';

import { DigitalCard } from './DigitalCard';
import { DigitalCardDetails } from './DigitalCardDetails';
import { SupervisorCardContainer } from './Supervisor.styled';
import type {
    IDigitalInteractionTable,
    InteractionData,
} from './types/Supervisor';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import translate from '../../helpers/translate';

export const SupervisorDigitalListCrm: FC<IDigitalInteractionTable> = ({
    MonitorSvc,
    CallSvc,
    digitalTaskList,
    agentList,
    monitorAgentCallback,
    monitoredAgent,
    loggedInAgentId,
    selectedChannels,
    searchValue,
    AgentSvc,
    filterColumns,
    setIsSelectedInCrm,
    showTableConfig,
    digitalTaskMonitor,
    selectedIds,
}) => {
    const { digitalAgentEnabled } = AgentSvc;
    const [filterDigitalList, setFilterDigitalList] =
        useState<InteractionData[]>(digitalTaskList);
    const [selectedDigitalList, setSelectedDigitalList] =
        useState<InteractionData | null>(null);
    const [isSelected, setIsSelected] = useState<boolean>(false);

    useEffect(() => {
        let filterAgent = [...digitalTaskList];

        if (selectedIds.length > 0) {
            filterAgent = filterAgent.filter((list) => {
                return selectedIds.includes(list.agentId);
            });
        }

        if (selectedChannels.length > 0) {
            filterAgent = filterAgent.filter((list) => {
                return selectedChannels.includes(list.sourceName);
            });
        }

        if (searchValue) {
            filterAgent = filterAgent.filter((list) => {
                return (
                    list.fullName
                        .toLowerCase()
                        .includes(searchValue.toLowerCase()) ||
                    list.sourceName
                        .toLowerCase()
                        .includes(searchValue.toLowerCase())
                );
            });
        }

        setFilterDigitalList(filterAgent);
    }, [searchValue, digitalTaskList, selectedChannels, selectedIds]);

    const onDigitalClick = (engagementId: string) => {
        let filterAgent = [...digitalTaskList];
        filterAgent = filterAgent.filter((list) => {
            return list.engagementId === engagementId;
        });
        setSelectedDigitalList(filterAgent[0]);
        setIsSelected(true);
        setIsSelectedInCrm(true);
    };

    useEffect(() => {
        let filterAgent = [...digitalTaskList];
        const engagementId = selectedDigitalList?.engagementId;
        if (engagementId) {
            filterAgent = filterAgent.filter((list) => {
                return list.engagementId === engagementId;
            });
            setSelectedDigitalList(filterAgent[0]);
            setIsSelected(!!filterAgent[0]);
            setIsSelectedInCrm(!!filterAgent[0]);
        }
    }, [digitalTaskList]);

    const onBackPressed = () => {
        setSelectedDigitalList(null);
        setIsSelected(false);
        setIsSelectedInCrm(false);
    };

    return (
        <SupervisorCardContainer isSelected={isSelected}>
            {!isSelected &&
                filterDigitalList?.map((list) => {
                    return (
                        <DigitalCard
                            MonitorSvc={MonitorSvc}
                            CallSvc={CallSvc}
                            agentList={agentList}
                            digitalTaskMonitor={digitalTaskMonitor}
                            key={list.glId}
                            onDigitalClick={onDigitalClick}
                            data={list}
                            loggedInAgentId={loggedInAgentId}
                            monitorAgentCallback={monitorAgentCallback}
                            monitoredAgent={monitoredAgent}
                            digitalAgentEnabled={digitalAgentEnabled}
                        />
                    );
                })}
            {!isSelected && filterDigitalList.length <= 0 && (
                <div className='no-result'>
                    {translate('CHAT.NO_CHATS.NO_INTERACTION_DG')}
                </div>
            )}
            {isSelected && selectedDigitalList?.agentId && (
                <DigitalCardDetails
                    showTableConfig={showTableConfig}
                    filterColumns={filterColumns}
                    data={selectedDigitalList}
                    onBackPressed={onBackPressed}
                    loggedInAgentId={loggedInAgentId}
                    monitorAgentCallback={monitorAgentCallback}
                    monitoredAgent={monitoredAgent}
                    digitalAgentEnabled={digitalAgentEnabled}
                />
            )}
        </SupervisorCardContainer>
    );
};

export default CreateAngularModule(
    'supervisorDigitalListCrm',
    SupervisorDigitalListCrm,
    [
        'digitalTaskList',
        'monitorAgentCallback',
        'monitoredAgent',
        'loggedInAgentId',
        'selectedIds',
        'selectedChannels',
        'searchValue',
        'filterColumns',
        'setIsSelectedInCrm',
        'showTableConfig',
        'digitalTaskMonitor',
        'agentList',
    ],
    ['AgentSvc', 'MonitorSvc', 'CallSvc']
);
