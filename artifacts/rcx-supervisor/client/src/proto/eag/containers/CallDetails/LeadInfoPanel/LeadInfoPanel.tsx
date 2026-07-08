import type { FC } from 'react';

import { EditLeadButton } from './components/EditLeadButton';
import type { ILeadInfoPanel } from './types/LeadInfoPanel';
import { CallDetailsPanel } from '../../../components/CallDetailsPanel/CallDetailsPanel';
import { Info } from '../../../components/Info';
import translate from '../../../helpers/translate';

export const LeadInfoPanel: FC<ILeadInfoPanel> = ({
    dataPairs,
    editLead,
    editLeadDisabled,
    CallSvc,
    AgentSvc,
}) => {
    const title = translate('LEAD_DETAIL.TITLE');

    const editLeadPanel = (
        <EditLeadButton
            editLead={editLead}
            editLeadDisabled={editLeadDisabled}
        />
    );
    const leadInfo = <Info dataPairs={dataPairs || []} />;

    return (
        <CallDetailsPanel
            CallSvc={CallSvc}
            AgentSvc={AgentSvc}
            headerContent={editLeadPanel}
            title={title}
            dataPairsContainer={leadInfo}
        />
    );
};
