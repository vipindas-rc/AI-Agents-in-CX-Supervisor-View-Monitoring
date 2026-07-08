import { Fragment, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { ActiveCallInteractionCard } from './component/ActiveCallInteractionCard';
import { CallPreviewInteractionCard } from './component/CallPreviewInteractionCard';
import { RnaStateCard } from './component/RnaStateCard';
import { useBehaviorSubject } from '../../../helpers/useBehaviorSubject';

type CallListProps = {
    CallSvc?: any;
    JupiterService?: any;
    CallPreviewSvc?: any;
    SessionSvc?: any;
    AgentSvc?: any;
    $state?: any;
    $rootScope?: any;
    CALL_EVENTS?: any;
    countdown: number;
};

export const CallList = ({
    CallSvc: CallSvcProp,
    JupiterService: JupiterServiceProp,
    CallPreviewSvc: CallPreviewSvcProp,
    SessionSvc: SessionSvcProp,
    AgentSvc: AgentSvcProp,
    $state: $stateProp,
    $rootScope: $rootScopeProp,
    CALL_EVENTS: CALL_EVENTSProp,
    countdown,
}: CallListProps) => {
    const { t } = useTranslation();
    const callService = CallSvcProp;
    const CallPreviewSvc = CallPreviewSvcProp;
    const AgentSvc = AgentSvcProp;
    const [isOnCallOrPendingDisp, setIsOnCallOrPendingDisp] = useState(() =>
        callService.onCallOrPendingDisp()
    );
    const isInCallPreview = useBehaviorSubject<boolean>(
        CallPreviewSvc.$isInCallPreview
    );
    const isRnaState = useBehaviorSubject<boolean>(AgentSvc.$isRnaState);

    useEffect(() => {
        const updateCallState = () => {
            setIsOnCallOrPendingDisp(callService.onCallOrPendingDisp());
        };

        updateCallState();

        const onCallSubscription =
            callService.$onCall.subscribe(updateCallState);
        const removePendingDispListener = $rootScopeProp.$on(
            CALL_EVENTSProp.PENDING_DISP,
            updateCallState
        );

        return () => {
            onCallSubscription.unsubscribe();
            removePendingDispListener();
        };
    }, [$rootScopeProp, CALL_EVENTSProp, callService]);

    return (
        <Fragment>
            <h2 className='typography-descriptorMiniSemiBold m-0 pt-3 text-[12px] [&:not(:has(+[data-interaction-card]))]:hidden'>
                {t('LEAD_DETAIL.CALL')}
            </h2>
            {isInCallPreview && (
                <CallPreviewInteractionCard
                    CallPreviewSvc={CallPreviewSvc}
                    $state={$stateProp}
                    countdown={countdown}
                />
            )}
            {isOnCallOrPendingDisp && !isInCallPreview && (
                <ActiveCallInteractionCard
                    CallSvc={callService}
                    JupiterService={JupiterServiceProp}
                    $rootScope={$rootScopeProp}
                    CALL_EVENTS={CALL_EVENTSProp}
                    $state={$stateProp}
                />
            )}
            {isRnaState && !isOnCallOrPendingDisp && (
                <RnaStateCard
                    SessionSvc={SessionSvcProp}
                    AgentSvc={AgentSvcProp}
                />
            )}
        </Fragment>
    );
};
