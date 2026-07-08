import { type FC, useState, useEffect, Fragment } from 'react';

import { OutboundCall, AgentVoice, Hold } from '@ringcx/ui';

import { SwitchMenu } from './MonitorSwitchMenu';
import {
    MonitorAgentCrmContainer,
    MonitorCallTime,
    MonitorButton,
    MonitorAgentDetails,
    MonitorAgentDetailsBargeIn,
    HoldContainor,
    MonitorWrapper,
    MonitorAgentDetailsBargeInContainer,
} from './Supervisor.styled';
import type {
    IMonitorCall,
    Session,
    Sessions,
    IHoldObj,
} from './types/Supervisor';
import { MONITOR_TYPES } from '../../constants/app';
import { SupervisorDataId } from '../../constants/testIds';
import { formatPhoneNumber } from '../../containers/Chat/ChatList/helpers';
import { hhMmSsFilter } from '../../helpers/timeUtils';
import translate from '../../helpers/translate';

export const MonitorCallCrm: FC<IMonitorCall> = ({
    MonitorSvc,
    AgentSvc,
    CallSvc,
    ApplicationSvc,
}) => {
    const [sessions, setSessions] = useState<Session[]>([]);
    const [holdObj, setHoldObj] = useState<IHoldObj>({
        customer: false,
        agents: {},
    });
    const createOptions = [
        {
            id: '1',
            title: translate(
                'AGENT_MONITOR.ACTIONS.COACH.' +
                    (MonitorSvc?.call?.type === MONITOR_TYPES.COACH
                        ? 'STOP'
                        : 'START')
            ),
            action: () => {
                toggleMonitor(MONITOR_TYPES.COACH);
            },
            isDisabled: coachingDisabled(),
        },
        {
            id: '2',
            title: translate(
                'AGENT_MONITOR.ACTIONS.BARGEIN.' +
                    (MonitorSvc?.call?.type === MONITOR_TYPES.BARGE_IN
                        ? 'STOP'
                        : 'START')
            ),
            action: () => {
                toggleMonitor(MONITOR_TYPES.BARGE_IN);
            },
            isDisabled: bargeInDisabled(),
        },
    ];
    function getMonitorButtonLabel() {
        let btnString = 'AGENT_MONITOR.ACTIONS.';

        if (isMonitorForThisAgent() && MonitorSvc.call.type != null) {
            btnString +=
                MonitorSvc?.call?.type.toUpperCase() +
                (MonitorSvc?.call?.connecting ? '.CONNECTING' : '.STOP');
        } else {
            btnString += 'MONITOR.START';
        }

        return btnString;
    }
    function isMonitorForThisAgent() {
        let isMonitoring = false;
        const monitoredAgentId = MonitorSvc?.monitoredAgent.agentId;

        if (MonitorSvc?.call.agent != null) {
            isMonitoring =
                MonitorSvc?.call.agent.agentId === monitoredAgentId ||
                MonitorSvc?.call.connecting;
        }

        return isMonitoring;
    }
    function toggleMonitor(monitorType: string) {
        const agent = MonitorSvc.monitoredAgent;
        if (
            (monitorType === MONITOR_TYPES.MONITOR &&
                !isMonitorForThisAgent()) ||
            (monitorType !== MONITOR_TYPES.MONITOR &&
                MonitorSvc.call.type === monitorType &&
                !isMonitorForThisAgent()) ||
            (MonitorSvc.call.type !== 'null' &&
                MonitorSvc.call.type !== monitorType)
        ) {
            CallSvc.voiceMonitorAction(
                monitorType,
                agent,
                MonitorSvc.getVoiceMonitorUii(agent)
            );
        } else {
            terminateSession();
        }
    }
    function terminateSession() {
        if (ApplicationSvc.isExplicitOffhook()) {
            AgentSvc.offhookTerm();
        }

        MonitorSvc.clearMonitor();
        CallSvc.reset();

        // for endCall notification, make sure we know we
        // were dealing with a monitoring type call
        CallSvc.currentCall.isMonitoring = true;
    }
    function bargeInDisabled() {
        return MonitorSvc?.call?.connecting || !monitoredAgentOnActiveCall();
    }

    function coachingDisabled() {
        return MonitorSvc?.call?.connecting || !monitoredAgentOnActiveCall();
    }
    function monitoredAgentOnActiveCall() {
        const agent = MonitorSvc?.call?.agent;
        const connecting = MonitorSvc?.call?.connecting;
        const monitoredAgentId = MonitorSvc?.monitoredAgent?.agentId;
        const callDuration = MonitorSvc?.monitoredAgent?.callDuration;

        const agentIsBeingMonitored =
            agent?.agentId && monitoredAgentId === agent?.agentId;
        const onActiveCall = callDuration && Number(callDuration) > 0;

        return !!(agentIsBeingMonitored && !connecting && onActiveCall);
    }
    function hold(onHold: boolean, sessionId: string) {
        CallSvc.holdSession(!onHold, sessionId);
    }

    useEffect(() => {
        const sessionsObj: Sessions = CallSvc.getTransferSessions?.();
        const sessionsArr: Session[] = [];
        Object.values(sessionsObj).forEach((session) => {
            sessionsArr.push(session);
        });

        setSessions(sessionsArr);
    }, [Object.keys(CallSvc.getTransferSessions?.()).length]);

    useEffect(() => {
        setHoldObj((pre) => {
            return {
                ...pre,
                customer: CallSvc.currentCall.onHold,
            };
        });
    }, [CallSvc.currentCall.onHold]);

    useEffect(() => {
        sessions.map((ses) => {
            setHoldObj((pre) => {
                return {
                    ...pre,
                    agents: {
                        ...pre.agents,
                        [ses.sessionId as string]: !!ses.onHold,
                    },
                };
            });
        });
    }, [sessions]);
    const onSessionHold = (session: Session) => {
        hold(!!session.onHold, session?.sessionId || '');
        setHoldObj((pre) => {
            return {
                ...pre,
                agents: {
                    ...pre.agents,
                    [session.sessionId as string]:
                        !pre.agents[session.sessionId as string],
                },
            };
        });
    };

    const onCustomerHold = () => {
        hold(!!CallSvc.currentCall.onHold, '1');
        setHoldObj((pre) => {
            return {
                ...pre,
                customer: !pre.customer,
            };
        });
    };

    return (
        (MonitorSvc.isMonitoredAgentCall ||
            MonitorSvc.isMonitoredAgentBargeIn) && (
            <MonitorWrapper>
                <MonitorAgentCrmContainer id='monitor-agent-crm'>
                    <MonitorCallTime data-aid={SupervisorDataId.CALL_DURATION}>
                        {hhMmSsFilter(MonitorSvc.call.duration)}
                    </MonitorCallTime>

                    {MonitorSvc.isMonitoredAgentBargeIn && (
                        <MonitorButton
                            data-aid={SupervisorDataId.HANGUP_BUTTON}
                            isBargeIn={true}
                            disable={!!MonitorSvc.call.connecting}
                            onClick={() => CallSvc.hangupOrPromptForSession()}
                        >
                            {translate('SOFTPHONE.HANGUP.HANGUP')}
                        </MonitorButton>
                    )}
                    {MonitorSvc.isMonitoredAgentCall && (
                        <Fragment>
                            <MonitorButton
                                data-aid={SupervisorDataId.MONITOR_BUTTON}
                                disable={!!MonitorSvc.call.connecting}
                                onClick={() =>
                                    toggleMonitor(
                                        MonitorSvc.call.type ||
                                            MONITOR_TYPES.MONITOR
                                    )
                                }
                            >
                                {translate(getMonitorButtonLabel())}
                            </MonitorButton>
                            <SwitchMenu
                                data-aid={SupervisorDataId.MOINTOR_MENU}
                                shouldHide={MonitorSvc.call.connecting}
                                options={createOptions}
                            />
                        </Fragment>
                    )}
                </MonitorAgentCrmContainer>
                {!MonitorSvc.isMonitoredAgentBargeIn && (
                    <MonitorAgentDetails>
                        {MonitorSvc?.monitoredAgent?.firstName && (
                            <span data-aid={SupervisorDataId.AGENTNAME}>
                                <AgentVoice />
                                {`${MonitorSvc?.monitoredAgent?.firstName} ${MonitorSvc?.monitoredAgent?.lastName}`}
                            </span>
                        )}

                        {CallSvc.currentCall.ani && (
                            <span data-aid={SupervisorDataId.CURRENT_CALL}>
                                <OutboundCall />
                                {formatPhoneNumber(CallSvc.currentCall.ani)}
                            </span>
                        )}
                    </MonitorAgentDetails>
                )}
                <MonitorAgentDetailsBargeInContainer
                    data-aid={SupervisorDataId.BARGE_IN_CONTAINER}
                >
                    {MonitorSvc.isMonitoredAgentBargeIn &&
                        sessions.map((session) => {
                            return (
                                <MonitorAgentDetailsBargeIn
                                    data-aid={SupervisorDataId.SESSION_USER}
                                    key={`session_${session.sessionId}`}
                                    className='border-in'
                                >
                                    <span>
                                        <AgentVoice />
                                        {session.destination}
                                    </span>
                                    <HoldContainor
                                        data-aid={SupervisorDataId.HOLD_ICON}
                                        onClick={() => onSessionHold(session)}
                                        onHold={
                                            !!holdObj.agents[
                                                session.sessionId as string
                                            ]
                                        }
                                    >
                                        <Hold />
                                    </HoldContainor>
                                </MonitorAgentDetailsBargeIn>
                            );
                        })}
                    {MonitorSvc.isMonitoredAgentBargeIn && (
                        <MonitorAgentDetailsBargeIn className='shadow-in'>
                            <span data-aid={SupervisorDataId.CUSTOMER_ANI}>
                                <OutboundCall />
                                {formatPhoneNumber(CallSvc.currentCall.ani)}
                            </span>
                            <HoldContainor
                                data-aid={SupervisorDataId.HOLD_CUSTOMER}
                                onClick={onCustomerHold}
                                onHold={!!holdObj.customer}
                            >
                                <Hold />
                            </HoldContainor>
                        </MonitorAgentDetailsBargeIn>
                    )}
                </MonitorAgentDetailsBargeInContainer>
            </MonitorWrapper>
        )
    );
};
