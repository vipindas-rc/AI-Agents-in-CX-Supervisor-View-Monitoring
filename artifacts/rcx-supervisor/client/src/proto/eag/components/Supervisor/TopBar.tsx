import type { FC } from 'react';
import { useEffect, useState } from 'react';

import { handleKeyboardClick } from '@ringcx/ui';

import { AgentFilter } from './AgentFilter';
import {
    SupervisorHeaderContainer,
    AgentList,
    Dropdown,
    SearchBarSup,
    SettingIcon,
} from './Supervisor.styled';
import type { ISupervisorTobBar } from './types/Supervisor';
import { SupervisorDataId } from '../../constants/testIds';
import translate from '../../helpers/translate';

export const SupervisorTopBar: FC<ISupervisorTobBar> = ({
    SupervisorSvc,
    AgentSvc,
    ApplicationSvc,
    setSegmentIndex,
    showTableConfig,
    isSelectedInCrm,
    segmentIndex,
    syncSelectedAgents,
}) => {
    const [type, setType] = useState<string>(segmentIndex.toString() || '0');
    const [searchVal, setSearchVal] = useState<string>('');
    const [agentFilter, setAgentFilter] = useState<boolean>(false);
    const [showFullSearch, setShowFullSearch] = useState<boolean>(false);
    useEffect(() => {
        setType(segmentIndex.toString());
    }, [segmentIndex]);
    const onDropdownChange = (value: string) => {
        setType(value);
        setSegmentIndex(parseInt(value));
        setSearchVal('');
        SupervisorSvc.searchValueAgent = '';
    };
    const agentList = [
        { id: '0', displayName: translate('MONITORING.LABELS.AGENTS') },
        { id: '1', displayName: translate('MONITORING.LABELS.INTERACTIONS') },
    ];
    function searchTextAgent(searchedValue: string, reset?: boolean) {
        if (reset) {
            SupervisorSvc.searchValueAgent = '';
            setSearchVal('');
            setShowFullSearch(false);
        } else {
            SupervisorSvc.searchValueAgent = searchedValue;
            setSearchVal(searchedValue);
        }
    }
    const handleFocus = (flag: boolean) => {
        if (!searchVal || flag) setShowFullSearch(flag);
    };
    const onFilterToggle = (isActive: boolean) => {
        if (isActive !== agentFilter) setAgentFilter(isActive);
    };

    return !isSelectedInCrm ? (
        <SupervisorHeaderContainer agentFilter={agentFilter}>
            <AgentList>
                {!showFullSearch && (
                    <Dropdown
                        selectedItemId={type}
                        title=''
                        placeholder=''
                        size='small'
                        error={false}
                        message=''
                        data={{
                            items: agentList,
                        }}
                        onChange={onDropdownChange}
                        data-aid={SupervisorDataId.SUPERVISORTYPE}
                    />
                )}
                <SearchBarSup
                    placeholder={translate(
                        'MONITORING.SEARCH_BAR.SEARCH_INPUT_PLACEHOLDER'
                    )}
                    enableFilter={true}
                    value={searchVal}
                    filterCount={SupervisorSvc?.appliedFiltersForAgents?.length}
                    filterInitState={agentFilter}
                    filterLabel={''}
                    onChange={searchTextAgent}
                    onFilterToggle={onFilterToggle}
                    onClean={() => searchTextAgent('', true)}
                    onFocus={() => handleFocus(true)}
                    onBlur={() => handleFocus(false)}
                    data-aid={SupervisorDataId.SEARCH_SUPERVISOR_AGENTS}
                />
                {!showFullSearch && (
                    <SettingIcon
                        className='setting-icons'
                        onClick={showTableConfig}
                        aria-label='settings'
                        role='button'
                        tabIndex={0}
                        onKeyDown={handleKeyboardClick(showTableConfig)}
                    />
                )}
            </AgentList>

            {agentFilter && (
                <AgentFilter
                    syncSelectedAgents={syncSelectedAgents}
                    type={type}
                    SupervisorSvc={SupervisorSvc}
                    AgentSvc={AgentSvc}
                    ApplicationSvc={ApplicationSvc}
                />
            )}
        </SupervisorHeaderContainer>
    ) : null;
};
