import { type FC } from 'react';

import { MonitorCallCrm } from './MonitorCall';
import { SupervisorTopBar } from './TopBar';
import type { ISupervisorCrm } from './types/Supervisor';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export const SupervisorComponent: FC<ISupervisorCrm> = ({
    supervisorSvc,
    AgentSvc,
    ApplicationSvc,
    MonitorSvc,
    searchValue,
    setSegmentIndex,
    showTableConfig,
    isSelectedInCrm,
    segmentIndex,
    CallSvc,
    syncSelectedAgents,
}) => {
    return (
        <div id='supervisee-detail-header'>
            <MonitorCallCrm
                MonitorSvc={MonitorSvc}
                AgentSvc={AgentSvc}
                CallSvc={CallSvc}
                ApplicationSvc={ApplicationSvc}
            />
            <SupervisorTopBar
                segmentIndex={segmentIndex}
                SupervisorSvc={supervisorSvc}
                AgentSvc={AgentSvc}
                ApplicationSvc={ApplicationSvc}
                searchValue={searchValue}
                setSegmentIndex={setSegmentIndex}
                showTableConfig={showTableConfig}
                isSelectedInCrm={isSelectedInCrm}
                syncSelectedAgents={syncSelectedAgents}
            />
        </div>
    );
};

export default CreateAngularModule(
    'supervisorComponent',
    SupervisorComponent,
    [],
    ['ApplicationSvc', 'AgentSvc', 'Dialog', 'MonitorSvc', 'CallSvc']
);
