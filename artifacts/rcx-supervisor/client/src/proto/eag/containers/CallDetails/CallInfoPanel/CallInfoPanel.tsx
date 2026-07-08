import type { FC } from 'react';

import { CallTimer } from './components/CallTimer';
import type { ICallInfoPanel } from './types/CallInfoPanel';
import { CallDetailsPanel } from '../../../components/CallDetailsPanel/CallDetailsPanel';
import { Info } from '../../../components/Info';
import translate from '../../../helpers/translate';
import { isCallPreviewPage } from '../../../helpers/utils';

export const CallInfoPanel: FC<ICallInfoPanel> = ({
    duration,
    callType,
    dataPairs,
    callUii,
    confirmationFunction,
    CallSvc,
    AgentSvc,
    originatedFrom,
    $state,
}) => {
    const title = translate('CURRENT_CALL.CALL_INFO');
    const isCallPreview = isCallPreviewPage($state?.current?.name);
    const callTimer = isCallPreview ? null : (
        <CallTimer callType={callType || 'INBOUND'} duration={duration || 0} />
    );

    const callInfo = <Info dataPairs={dataPairs || []} />;

    return (
        <CallDetailsPanel
            headerContent={callTimer}
            title={title}
            dataPairsContainer={callInfo}
            callUii={callUii}
            confirmationFunction={confirmationFunction}
            CallSvc={CallSvc}
            AgentSvc={AgentSvc}
            originatedFrom={originatedFrom}
            $state={$state}
        />
    );
};
