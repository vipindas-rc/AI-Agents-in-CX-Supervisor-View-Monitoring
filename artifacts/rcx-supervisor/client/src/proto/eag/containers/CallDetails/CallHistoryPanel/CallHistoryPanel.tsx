import type { FC } from 'react';
import { useState } from 'react';

import { LoadHistoryButton } from './components/LoadHistoryButton';
import type { ICallHistoryPanel } from './types/CallHistoryRecord';
import { CallDetailsPanel } from '../../../components/CallDetailsPanel/CallDetailsPanel';
import translate from '../../../helpers/translate';

export const CallHistoryPanel: FC<ICallHistoryPanel> = ({
    leadSvc,
    leadId,
    CallSvc,
    AgentSvc,
    className,
}) => {
    const title = translate('LEAD_DETAIL.MODAL.HISTORY.HISTORY');

    const [histList, setHistList] = useState([]);

    const showHistoryButton = (
        <LoadHistoryButton
            leadSvc={leadSvc}
            updateHistoryList={setHistList}
            leadId={leadId}
        />
    );

    return (
        <CallDetailsPanel
            className={className}
            headerContent={showHistoryButton}
            title={title}
            dataPairsContainer={histList}
            CallSvc={CallSvc}
            AgentSvc={AgentSvc}
        />
    );
};
