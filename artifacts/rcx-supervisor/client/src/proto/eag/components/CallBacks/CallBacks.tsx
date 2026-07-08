import { useCallback, type FC, useState, useEffect, useMemo } from 'react';

import { DateTime } from '@ringcx/shared';
import { IconButton, Edit, Close, OutboundCallAlt } from '@ringcx/ui';
import { filter } from 'lodash';

import {
    CallBackContainer,
    CallBacksSegmentWrap,
    CallBacksHeader,
    CallBackDetails,
    CallBackHeader,
    CallBackListContainer,
    CallBackContentContainer,
    CallBackContent,
    CallBackActions,
    Button,
    StyledButton,
    StyledSegments,
    StyledCardContent,
    CallBackBtn,
    CallBackBtnDetails,
    NoCallBacksText,
} from './CallBacksPanel.styled';
import {
    CallbackMode,
    LeadClass,
    LeadState,
} from './types/enums/CallBacks.enum';
import type {
    ICallBackMode,
    ICallBacksPanel,
    Lead,
} from './types/interfaces/CallBacksPanel';
import {
    CALLBACK_CLOSE_BUTTON_DTID,
    CALLBACK_EDIT_BUTTON_DTID,
    CALLBACK_LEAD_NAME_DTID,
    CALLBACK_OUTBOUND_BUTTON_DTID,
    FLUSH_CALLBACK_BUTTON_DTID,
    REFRESH_CALLBACK_BUTTON,
    CALLBACK_SEGMENTS,
    CONFIRM_DAIL_ACTIONS,
    NO_CALLBACKS,
} from '../../constants/testIds';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import injector from '../../helpers/injector';
import translate from '../../helpers/translate';

const NO_FUTURE_CALLBACKS_MSG = 'PHONE.CALLBACKS.NO_FUTURE_CALLBACKS_MSG';
const NO_CURR_CALLBACKS_MSG = 'PHONE.CALLBACKS.NO_CURR_CALLBACKS_MSG';
const FLUSH_TEXT = 'PHONE.CALLBACKS.FLUSH_COMPLETED';
const REFRESH_CALLBACKS_TEXT = 'PHONE.CALLBACKS.REFRESH_CALLBACKS';
const CONFIRM_CANCEL_MSG = 'PHONE.CALLBACKS.CONFIRM_CANCEL_MGS';
const CONFIRM_CANCEL_TITLE = 'PHONE.CALLBACKS.CONFIRM_CANCEL_TITLE';

export const CallBacks: FC<ICallBacksPanel> = ({
    LeadDialogFactory,
    OutboundSvc,
    Dialog,
    LeadSvc,
    SessionSvc,
    E164UtilsSvc,
}) => {
    const [callbackType, setCallbackType] = useState(
        CallbackMode.CURRENT_CALLBACK
    );
    const [callbackList, setCallbackList] = useState([]);
    const [pendingRefresh, setPendingRefresh] = useState(false);
    const [pendingDial, setPendingDial] = useState(false);
    const [isI18nEnabled, setIsI18nEnabled] = useState(false);
    const CURRENT = translate('PHONE.CALLBACKS.CURRENT');
    const FUTURE = translate('PHONE.CALLBACKS.FUTURE');

    const callbackModes: ICallBackMode[] = [
        { label: CURRENT, value: CallbackMode.CURRENT_CALLBACK },
        { label: FUTURE, value: CallbackMode.FUTURE_CALLBACK },
    ];

    useEffect(() => {
        setCallbackList(OutboundSvc.agentCallbacks);
        setIsI18nEnabled(SessionSvc.isI18nEnabled());
    }, []);

    const getButtonText = useCallback(() => {
        return callbackType === CallbackMode.CURRENT_CALLBACK
            ? translate(FLUSH_TEXT)
            : translate(REFRESH_CALLBACKS_TEXT);
    }, [callbackType]);

    const getNoContentText = useCallback(() => {
        return callbackType === CallbackMode.CURRENT_CALLBACK
            ? translate(NO_CURR_CALLBACKS_MSG)
            : translate(NO_FUTURE_CALLBACKS_MSG);
    }, [callbackType]);

    const handleTabSwitch = useCallback(
        (callbackMode: ICallBackMode) => {
            const AnalyticsSvc = injector('AnalyticsSvc');
            AnalyticsSvc.track('RCX_more_callBacks_action', {
                tab: callbackMode,
            });
            setCallbackType(callbackMode.value);
            setCallbackList(
                callbackMode.value === CallbackMode.CURRENT_CALLBACK
                    ? OutboundSvc.agentCallbacks
                    : OutboundSvc.futureCallbacks
            );
        },
        [OutboundSvc.agentCallbacks, OutboundSvc.futureCallbacks]
    );

    const refreshFutureCallbacks = useCallback(() => {
        setPendingRefresh(true);
        OutboundSvc.getFutureCallbacks().finally(() =>
            setPendingRefresh(false)
        );
    }, [OutboundSvc, setPendingRefresh]);

    const flushCompleted = useCallback(() => {
        const states = [
            LeadState.PENDING,
            LeadState.DIALING,
            LeadState.RINGING,
        ];
        OutboundSvc.agentCallbacks = filter(
            OutboundSvc.agentCallbacks,
            (l) => states.indexOf(l.leadState) !== -1
        );
        setCallbackList(OutboundSvc.agentCallbacks);
    }, [OutboundSvc.agentCallbacks]);

    const onAction = useCallback(() => {
        const AnalyticsSvc = injector('AnalyticsSvc');
        if (callbackType === CallbackMode.CURRENT_CALLBACK) {
            AnalyticsSvc.track('RCX_more_callBacks_action', {
                option: 'flush completed callbacks',
            });
            flushCompleted();
        } else {
            AnalyticsSvc.track('RCX_more_callBacks_action', {
                option: 'refresh callbacks',
            });
            refreshFutureCallbacks();
        }
    }, [callbackType, flushCompleted, refreshFutureCallbacks]);

    const segmentItems = useMemo(
        () =>
            callbackModes.map((mode: ICallBackMode) => {
                return { title: mode.label };
            }),
        []
    );

    const dial = (lead: Lead) => {
        setPendingDial(true);
        LeadSvc.dialLead(lead).finally(() => setPendingDial(false));
    };

    const getLeadDesinationE164 = (lead: Lead) => {
        if (isI18nEnabled) {
            return E164UtilsSvc.getE164FormattedNumber(
                lead,
                'destination',
                true
            );
        }

        return lead.destination;
    };

    const cancelCallback = (lead: Lead) => {
        const cancelLeadId = lead.leadId;
        const msg = translate(CONFIRM_CANCEL_MSG, {
            number: getLeadDesinationE164(lead),
        });
        Dialog.confirm(
            '#cancelBtn',
            CONFIRM_CANCEL_TITLE,
            msg,
            null,
            null,
            null,
            CONFIRM_DAIL_ACTIONS
        ).then(function () {
            const AnalyticsSvc = injector('AnalyticsSvc');
            AnalyticsSvc.track('RCX_more_callBacks_action', {
                option: 'delete',
            });
            // request cancelation
            OutboundSvc.cancelCallback(cancelLeadId).then(() => {
                //refetch the updated list
                if (callbackType === CallbackMode.CURRENT_CALLBACK) {
                    OutboundSvc.agentCallbacks = filter(
                        OutboundSvc.agentCallbacks,
                        (l) => l.leadId !== cancelLeadId
                    );
                    setCallbackList(OutboundSvc.agentCallbacks);
                } else {
                    OutboundSvc.getFutureCallbacks().finally(() => {
                        setCallbackList(OutboundSvc.futureCallbacks);
                    });
                }
            });
        });
    };

    const openDetail = (lead: Lead) => {
        const AnalyticsSvc = injector('AnalyticsSvc');
        AnalyticsSvc.track('RCX_more_callBacks_action', { option: 'edit' });
        lead.isFutureCallback = callbackType === CallbackMode.FUTURE_CALLBACK;
        LeadDialogFactory.leadDetail(lead);
    };

    const getLeadClass = (lead: Lead) => {
        if (lead.leadState === LeadState.ANSWER) {
            return LeadClass.LEAD_ANSWERED;
        }
        if (
            lead.leadState === LeadState.DIALING ||
            lead.leadState === LeadState.RINGING
        ) {
            return LeadClass.LEAD_DIALING;
        }
        if (lead.leadState === LeadState.EXPIRED) {
            return LeadClass.LEAD_EXPIRED;
        }
        return '';
    };

    const getFullName = (lead: Lead) => `${lead.firstName} ${lead.lastName}`;

    const getButtonTestId = useMemo(
        () =>
            callbackType === CallbackMode.CURRENT_CALLBACK
                ? FLUSH_CALLBACK_BUTTON_DTID
                : REFRESH_CALLBACK_BUTTON,
        [callbackType]
    );

    const getDateTime = (date: string) => {
        const formattedDate = DateTime.fromSQLToDateTime(date);
        return DateTime.localizedDateTimeFromObject({
            dateTime: formattedDate,
            toLocalizedPresetFormat: DateTime.PRESET.DATETIME_SHORT,
        });
    };

    const CardList = () => (
        <CallBackListContainer>
            {callbackList.map((lead: Lead) => (
                <CallBackDetails
                    leadClass={getLeadClass(lead)}
                    key={lead.leadId}
                >
                    <CallBackHeader data-aid={CALLBACK_LEAD_NAME_DTID}>
                        {getFullName(lead)}
                    </CallBackHeader>
                    <CallBackContentContainer>
                        <CallBackContent>
                            {getDateTime(lead.dialTime)}
                        </CallBackContent>
                        <CallBackContent>
                            <CallBackActions>
                                <StyledButton
                                    disableRipple={false}
                                    onClick={() => openDetail(lead)}
                                    data-aid={CALLBACK_EDIT_BUTTON_DTID}
                                    aria-label={translate(
                                        'PHONE.CALLBACKS.DETAIL'
                                    )}
                                >
                                    <Edit />
                                </StyledButton>
                                {callbackType ===
                                    CallbackMode.CURRENT_CALLBACK && (
                                    <IconButton
                                        disableRipple={false}
                                        disabled={pendingDial}
                                        onClick={() => dial(lead)}
                                        data-aid={CALLBACK_OUTBOUND_BUTTON_DTID}
                                        aria-label={translate(
                                            'PHONE.CALLBACKS.DIAL'
                                        )}
                                    >
                                        <OutboundCallAlt />
                                    </IconButton>
                                )}
                                <IconButton
                                    disableRipple={false}
                                    onClick={() => cancelCallback(lead)}
                                    data-aid={CALLBACK_CLOSE_BUTTON_DTID}
                                    aria-label={translate(
                                        'PHONE.CALLBACKS.CANCEL'
                                    )}
                                >
                                    <Close />
                                </IconButton>
                            </CallBackActions>
                        </CallBackContent>
                    </CallBackContentContainer>
                </CallBackDetails>
            ))}
        </CallBackListContainer>
    );

    return (
        <CallBackContainer>
            <CallBacksHeader>
                {translate('PHONE.CALLBACKS.CALLBACKS')}
            </CallBacksHeader>
            <CallBacksSegmentWrap>
                <StyledSegments
                    data-aid={CALLBACK_SEGMENTS}
                    size='small'
                    index={callbackModes.findIndex(
                        (mode) => mode.value === callbackType
                    )}
                    onChange={(index: number) => {
                        handleTabSwitch({
                            label: callbackModes[index].label,
                            value: callbackModes[index].value,
                        });
                    }}
                    items={segmentItems}
                />
            </CallBacksSegmentWrap>
            {callbackList.length <= 0 && (
                <CallBacksSegmentWrap data-aid={NO_CALLBACKS}>
                    <NoCallBacksText>{getNoContentText()}</NoCallBacksText>
                </CallBacksSegmentWrap>
            )}
            <StyledCardContent>
                <CardList />
            </StyledCardContent>
            <CallBackBtn>
                <CallBackBtnDetails>
                    <Button
                        data-aid={getButtonTestId}
                        disabled={pendingRefresh}
                        onClick={onAction}
                    >
                        {getButtonText()}
                    </Button>
                </CallBackBtnDetails>
            </CallBackBtn>
        </CallBackContainer>
    );
};

export default CreateAngularModule(
    'callbacks',
    CallBacks,
    [],
    [
        'OutboundSvc',
        'LeadDialogFactory',
        'SessionSvc',
        'E164UtilsSvc',
        'Dialog',
        'LeadSvc',
    ]
);
