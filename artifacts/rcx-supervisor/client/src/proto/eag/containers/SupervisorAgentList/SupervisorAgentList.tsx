import type { FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import {
    CHANGE_AGENT_STATE_AVAILABILITY_FLAG,
    FfsService,
    searchFiltration,
    Session,
} from '@ringcx/shared';
import type { FiltrationCallback } from '@ringcx/ui';

import SupervisorRowRenderer from './components/SupervisorRowRenderer';
import {
    EmptyResult,
    EmptyWrapper,
    StyledSupervisorAgentList,
} from './SupervisorAgentList.styled';
import type {
    AgentRows,
    ISupervisorAgentList,
    ISupervisorAgentListItem,
} from './types/SupervisorAgentList';
import {
    agentChannelCol,
    agentSearchIndexes,
    agentStatesCol,
} from './types/SupervisorAgentList';
import { NO_AGENTS_ACTIVITY, NO_MATCH_FOUND } from '../../constants/testIds';
import { announceToScreenReader } from '../../helpers/a11y';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import translate from '../../helpers/translate';

export function filterAgentRows(
    rows: AgentRows[],
    selectedStates: string[],
    selectedChannels: string[],
    searchValue: string
): AgentRows[] {
    // strict (exact) match so selecting "Inactive" doesn't also match the
    // "Pending Inactive" AirPro state (substring overlap).
    let filtered = searchFiltration(rows, agentStatesCol, selectedStates, true);
    filtered = searchFiltration(filtered, agentChannelCol, selectedChannels);
    if (searchValue.length > 1) {
        filtered = searchFiltration(filtered, agentSearchIndexes, searchValue);
    }
    return filtered;
}

export const SupervisorAgentList: FC<ISupervisorAgentList> = ({
    agentList,
    columns,
    onInteractionsClick,
    loggedInAgentId,
    onLogOut,
    changeAgentState,
    monitorAgentCallback,
    monitoredAgent,
    selectedStates,
    selectedChannels,
    searchValue,
    onInteractionRollupClick,
    ...restProps
}) => {
    const [isChangeAgentStateAvailable, setIsChangeAgentStateAvailable] =
        useState(false);

    const visibleColumns = useMemo(
        () => columns.filter((col) => !col.hiddenColumn),
        [columns]
    );

    const filteredCount = useMemo(() => {
        if (!agentList?.length) return 0;
        return filterAgentRows(
            agentList as AgentRows[],
            selectedStates,
            selectedChannels,
            searchValue
        ).length;
    }, [agentList, selectedStates, selectedChannels, searchValue]);

    useEffect(() => {
        if (filteredCount === 0) {
            announceToScreenReader(
                translate('DASHBOARD.AGENTS.GRID.NO_MATCH_FOUND')
            );
        } else if (filteredCount === 1) {
            announceToScreenReader(
                translate('CRM.COMMON.MATCHES_FOUND', { count: filteredCount })
            );
        } else {
            announceToScreenReader(
                translate('CRM.COMMON.MATCHES_FOUND_plural', {
                    count: filteredCount,
                })
            );
        }
    }, [filteredCount]);

    useEffect(() => {
        (async () => {
            const { agentDetails } = Session.getUserDetails();
            const subAccountId = agentDetails?.find(
                (agent) => agent.agentId.toString() === loggedInAgentId
            )?.accountId;

            const { flags } = await FfsService.instance().getFeatureFlag({
                storeFfsDomain: true,
                discoveryParams: {
                    isExternal: false,
                },
                ffsParams: {
                    body: {
                        flags: [CHANGE_AGENT_STATE_AVAILABILITY_FLAG],
                        parameters: { subAccountId },
                    },
                },
            });

            setIsChangeAgentStateAvailable(
                flags[CHANGE_AGENT_STATE_AVAILABILITY_FLAG]
            );
        })();
    }, [setIsChangeAgentStateAvailable]);

    const filtrationCallback = useCallback<
        FiltrationCallback<ISupervisorAgentListItem>
    >(
        (data) => [
            filterAgentRows(
                data as AgentRows[],
                selectedStates,
                selectedChannels,
                searchValue
            ),
        ],
        [selectedStates, selectedChannels, searchValue]
    );
    const renderEmptyFilterResult = useCallback(() => {
        return (
            <EmptyWrapper>
                <EmptyResult data-aid={NO_MATCH_FOUND}>
                    {translate('DASHBOARD.AGENTS.GRID.NO_MATCH_FOUND')}
                </EmptyResult>
            </EmptyWrapper>
        );
    }, [translate]);
    const renderRow = useCallback(
        (rowData: ISupervisorAgentListItem) => (
            <SupervisorRowRenderer
                {...{
                    data: rowData,
                    columns,
                    onInteractionsClick,
                    loggedInAgentId,
                    onLogOut,
                    changeAgentState,
                    monitorAgentCallback,
                    monitoredAgent,
                    onInteractionRollupClick,
                    isChangeAgentStateAvailable,
                }}
            />
        ),
        [
            columns,
            onInteractionsClick,
            loggedInAgentId,
            onLogOut,
            changeAgentState,
            monitorAgentCallback,
            monitoredAgent,
            onInteractionRollupClick,
            isChangeAgentStateAvailable,
        ]
    );

    return agentList && agentList.length > 0 ? (
        <StyledSupervisorAgentList<ISupervisorAgentListItem>
            {...{
                columns: visibleColumns,
                data: agentList,
                renderRow,
                renderEmptyFilterResult,
                filtrationCallback,
                listAriaLabel: `${translate('MONITORING.LABELS.SUPERVISED_AGENTS')}`,
                restProps,
            }}
        />
    ) : (
        <EmptyWrapper>
            <EmptyResult data-aid={NO_AGENTS_ACTIVITY}>
                {translate('DASHBOARD.AGENTS.GRID.NO_AGENTS_MSG')}
            </EmptyResult>
        </EmptyWrapper>
    );
};

export default CreateAngularModule(
    'supervisorAgentList',
    SupervisorAgentList,
    [
        'agentList',
        'columns',
        'onInteractionsClick',
        'onInteractionRollupClick',
        'loggedInAgentId',
        'onLogOut',
        'changeAgentState',
        'monitorAgentCallback',
        'monitoredAgent',
        'selectedStates',
        'selectedChannels',
        'searchValue',
    ],
    []
);
