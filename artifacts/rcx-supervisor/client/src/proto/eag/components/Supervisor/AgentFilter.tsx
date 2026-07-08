import type { FC } from 'react';
import { useEffect, useMemo, useState } from 'react';

import type { IMenuItem } from '@ringcx/ui';
import { DotColor, DisplayVariantType } from '@ringcx/ui';
import { toUpper, uniqBy } from 'lodash';

import { FilterColumn, FilterDropdown } from './Supervisor.styled';
import { MANUALLY_ADD_CHANNELS } from '../../../src/helpers/agentChannels';
import { SupervisorDataId } from '../../constants/testIds';
import { agentStateColor } from '../../helpers/agentState';
import translate from '../../helpers/translate';

export const AgentFilter: FC<{
    SupervisorSvc: any;
    AgentSvc: any;
    ApplicationSvc: any;
    type: string;
    syncSelectedAgents: () => void;
}> = ({ SupervisorSvc, AgentSvc, ApplicationSvc, type }) => {
    const [agentStatus, setAgentStatus] = useState<string>('');
    const [agentName, setAgentName] = useState<string>('');

    const [agentChannel, setAgentChannel] = useState<string>('');
    const [filterDataAgentStatus, setFilterDataAgentStatus] = useState<
        IMenuItem[]
    >([]);
    const [filterAgentChannels, setFilterAgentChannels] = useState<IMenuItem[]>(
        []
    );
    const [agentsNamesDropdown, setAgentsNamesDropdown] = useState<IMenuItem[]>(
        []
    );
    const filterAgentName = (value: string) => {
        setAgentName(value);
        if (value === '0') SupervisorSvc.selectedAgentIdsForInteractions = [];
        else SupervisorSvc.selectedAgentIdsForInteractions = [value];
    };
    const filterAgentStatus = (value: string) => {
        setAgentStatus(value);
        if (value === '0') SupervisorSvc.selectedAgentStatesForAgent = [];
        else SupervisorSvc.selectedAgentStatesForAgent = [value];
    };
    const filterAgentChannel = (value: string) => {
        setAgentChannel(value);
        if (value === '0') {
            SupervisorSvc.selectedChannelsForAgent = [];
            SupervisorSvc.selectedChannelsForInteractions = [];
        } else {
            SupervisorSvc.selectedChannelsForAgent = [value];
            SupervisorSvc.selectedChannelsForInteractions = [value];
        }
    };
    const _buildChannelsDropdown = () => {
        const accountId = AgentSvc.getAccountId();
        const edSources =
            ApplicationSvc.getEdSourcesForAccount(accountId) || [];
        const channels = edSources.map(
            (source: { name: string; type: string }) => ({
                id: source.name || source.type,
                displayName: source.name || source.type,
            })
        );
        const allChannels = _addAddtionalChannelsManually(channels);

        const agentsChannelsDropdown: IMenuItem[] = [
            ..._sortAndRemoveDuplicateChannels(allChannels),
        ];

        setFilterAgentChannels(agentsChannelsDropdown);
    };
    const _addAddtionalChannelsManually = (channels: any) => {
        const newChannels = MANUALLY_ADD_CHANNELS.map((channel) => ({
            id: channel.label,
            displayName: translate(channel.translationPath) || channel.label,
        }));

        return [
            {
                id: '0',
                displayName: translate(
                    'MONITORING.SEARCH_BAR.OPENED_PLACE_HOLDER_ALL_CHANNELS'
                ),
            },
            ...channels,
            ...newChannels,
        ];
    };
    const _sortAndRemoveDuplicateChannels = (channels: IMenuItem[]) => {
        const _channels = [...channels];
        const unsortedChannels: IMenuItem[] = uniqBy(_channels, 'id');
        return unsortedChannels;
    };
    useEffect(() => {
        setAgentChannel('');
        setAgentName('');
        setAgentStatus('');
        SupervisorSvc.selectedAgentStatesForAgent = [];
        SupervisorSvc.selectedChannelsForAgent = [];
        SupervisorSvc.selectedChannelsForInteractions = [];
        SupervisorSvc.selectedAgentIdsForInteractions = [];
    }, [type]);
    useEffect(() => {
        const filterData: IMenuItem[] = [
            {
                id: '0',
                displayName: translate(
                    'MONITORING.SEARCH_BAR.OPENED_PLACE_HOLDER_ALL_STATES'
                ),
                variant: {
                    type: DisplayVariantType.Dot,
                    color: DotColor.Default,
                },
            },
        ];
        SupervisorSvc.agentStateDropdownList?.map(
            (list: { id: string; displayName: string }) => {
                const dotColor = agentStateColor(toUpper(list.displayName));
                filterData.push({
                    id: list.id,
                    displayName: list.displayName,
                    variant: {
                        type: DisplayVariantType.Dot,
                        color: dotColor as DotColor,
                    },
                });
            }
        );

        setFilterDataAgentStatus(filterData);
        _buildChannelsDropdown();
    }, [SupervisorSvc.agentStateDropdownList]);
    const buildAgentNameDropdown = (rows: any[]) => {
        const temp: IMenuItem[] = [
            {
                id: '0',
                displayName: translate(
                    'MONITORING.SEARCH_BAR.CLOSED_PLACE_HOLDER'
                ),
            },
        ];
        rows.forEach((agent: { agentId: string; fullName: string }) => {
            if (AgentSvc.agentSettings.agentId !== agent.agentId) {
                temp.push({
                    id: agent.agentId,
                    displayName: agent.fullName,
                });
            }
        });
        const agentsNames = uniqBy(temp, 'id');
        setAgentsNamesDropdown(agentsNames);
    };
    useEffect(() => {
        const digitalTaskList = [...SupervisorSvc.interactionList];
        buildAgentNameDropdown(digitalTaskList);
    }, [SupervisorSvc.interactionList]);
    const channelDropdownComponent = useMemo(() => {
        return (
            <FilterDropdown
                isSearchable
                isChannelDropdown={true}
                selectedItemId={agentChannel}
                title=''
                placeholder={translate(
                    'MONITORING.SEARCH_BAR.OPENED_PLACE_HOLDER_ALL_CHANNELS'
                )}
                size='small'
                error={false}
                message=''
                data={{
                    items: filterAgentChannels,
                }}
                onChange={filterAgentChannel}
                data-aid={SupervisorDataId.FILTERAGENTCHANNEL}
            />
        );
    }, [filterAgentChannels, agentChannel]);
    const agentStatusComponent = useMemo(() => {
        return (
            <FilterDropdown
                isSearchable
                selectedItemId={agentStatus}
                title=''
                placeholder={translate(
                    'MONITORING.SEARCH_BAR.OPENED_PLACE_HOLDER_ALL_STATES'
                )}
                size='small'
                error={false}
                message=''
                data={{
                    items: filterDataAgentStatus,
                }}
                onChange={filterAgentStatus}
                data-aid={SupervisorDataId.AGENTSTATUS}
            />
        );
    }, [filterDataAgentStatus, agentStatus]);
    const agentNameComponent = useMemo(() => {
        return (
            <FilterDropdown
                isSearchable
                selectedItemId={agentName}
                title=''
                placeholder={translate(
                    'MONITORING.SEARCH_BAR.CLOSED_PLACE_HOLDER'
                )}
                size='small'
                error={false}
                message=''
                data={{
                    items: agentsNamesDropdown,
                }}
                onChange={filterAgentName}
                data-aid={SupervisorDataId.AGENTNAME}
            />
        );
    }, [agentsNamesDropdown, agentName]);
    return (
        <FilterColumn>
            {type === '0' && agentStatusComponent}
            {type === '1' && agentNameComponent}
            {channelDropdownComponent}
        </FilterColumn>
    );
};
