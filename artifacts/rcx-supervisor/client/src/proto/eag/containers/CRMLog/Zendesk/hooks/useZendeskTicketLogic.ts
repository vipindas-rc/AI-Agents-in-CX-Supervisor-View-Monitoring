import {
    useCallback,
    useEffect,
    useRef,
    useState,
    type MutableRefObject,
} from 'react';

import type { MatchItem } from '../../../../components/CRM/types';
import { ParamsType } from '../../../../constants/crm';
import { cacheTickets } from '../cache';
import {
    AUTO_CREATE_TICKET_REASON,
    RecordType,
    TICKET_CACHE_TIME,
} from '../constants';
import type { IZendeskLogFormData, ZendeskTicket } from '../types';

type TicketQueryState = {
    querySeq: number;
    completed: boolean;
    userId?: string;
    ticketCount: number;
};

const EMPTY_TICKET_QUERY_STATE: TicketQueryState = {
    querySeq: 0,
    completed: false,
    userId: undefined,
    ticketCount: 0,
};

function getPendingTicketQueryState(
    querySeq: number,
    userId?: string
): TicketQueryState {
    return {
        querySeq,
        completed: false,
        userId,
        ticketCount: 0,
    };
}

function getCompletedTicketQueryState(
    querySeq: number,
    userId: string | undefined,
    ticketCount: number
): TicketQueryState {
    return {
        querySeq,
        completed: true,
        userId,
        ticketCount,
    };
}

type UseZendeskTicketLogicParams = {
    CrmSvc: any;
    engageInfo: any;
    engageType?: string;
    formData: IZendeskLogFormData;
    formDataRef: MutableRefObject<IZendeskLogFormData>;
    updateFormData: (
        nextFormData: IZendeskLogFormData,
        options?: { force?: boolean }
    ) => void;
    selectedTicket?: ZendeskTicket;
    isSearchDetailOpen: boolean;
    isDigitalLogVisible?: boolean;
};

export function useZendeskTicketLogic({
    CrmSvc,
    engageInfo,
    engageType,
    formData,
    formDataRef,
    updateFormData,
    selectedTicket,
    isSearchDetailOpen,
    isDigitalLogVisible,
}: UseZendeskTicketLogicParams) {
    const [matchedTickets, setMatchedTickets] = useState<ZendeskTicket[]>([]);
    const [ticketQueryState, setTicketQueryState] = useState<TicketQueryState>(
        EMPTY_TICKET_QUERY_STATE
    );
    // Keep a ref snapshot so async handlers can always read latest options.
    const matchedTicketsRef = useRef<ZendeskTicket[]>([]);
    // Monotonic sequence to ignore stale ticket query responses.
    const ticketRequestSeqRef = useRef(0);
    // Prevent duplicate auto-create for the same user in one selection cycle.
    const autoCreateAttemptedUserIdRef = useRef<string | null>(null);

    useEffect(() => {
        matchedTicketsRef.current = matchedTickets;
    }, [matchedTickets]);

    const handleSelectTicket = useCallback(
        (ticketId: string) => {
            const currentFormData = formDataRef.current;
            const matchedTicket = matchedTicketsRef.current.find(
                (ticket) => ticket.id === ticketId
            );
            const nextTicketSubject =
                ticketId === ''
                    ? ''
                    : matchedTicket?.subject ||
                      currentFormData.ticket?.subject ||
                      '';
            updateFormData({
                ...currentFormData,
                ticket: {
                    id: ticketId,
                    subject: nextTicketSubject,
                },
            });
        },
        [formDataRef, updateFormData]
    );

    const createTicket = useCallback(
        async (
            reason?: string
        ): Promise<Pick<ZendeskTicket, 'id' | 'subject' | 'userId'> | null> => {
            let newTicket: Pick<
                ZendeskTicket,
                'id' | 'subject' | 'userId'
            > | null = null;
            const currentFormData = formDataRef.current;
            const zendeskLogInfo = {
                user: currentFormData.user,
                subject: currentFormData.subject,
            };
            try {
                const result = await CrmSvc.createRecord({
                    type: RecordType.Ticket,
                    call: { ...engageInfo, zendeskLogInfo },
                    ...(reason && { reason }),
                });

                const { success, data } = result;
                if (success && data) {
                    newTicket = {
                        id: data.id || data.ticketId,
                        subject: currentFormData.subject,
                        userId: data.userId,
                    };

                    const cached = cacheTickets.get(engageInfo.uii) || [];
                    cacheTickets.set(engageInfo.uii, [
                        ...cached,
                        { ...data, ...newTicket, timeStamp: Date.now() },
                    ]);
                }
                return newTicket;
            } catch {
                return null;
            }
        },
        [CrmSvc, engageInfo, formDataRef]
    );

    const handleCreateTicket = useCallback(async () => {
        const newTicket = await createTicket();
        if (newTicket) {
            setMatchedTickets((pre: ZendeskTicket[]) => [newTicket, ...pre]);
            if (newTicket.id) {
                handleSelectTicket(newTicket.id);
            }
        }
    }, [createTicket, handleSelectTicket]);

    const getTickets = useCallback(
        async (user: MatchItem) => {
            const requestSeq = ++ticketRequestSeqRef.current;
            const requestedUserId = user.id;
            setTicketQueryState(
                getPendingTicketQueryState(requestSeq, requestedUserId)
            );
            try {
                let records: ZendeskTicket[] = [];

                records = (
                    await CrmSvc.searchContacts({
                        type: RecordType.Ticket,
                        value: user.id,
                    })
                ).records;
                const currentUserId = formDataRef.current?.user?.id;
                const isStaleRequest =
                    requestSeq !== ticketRequestSeqRef.current ||
                    currentUserId !== requestedUserId;
                // Drop outdated responses when user changes during the request.
                if (isStaleRequest) {
                    return;
                }
                if (
                    selectedTicket &&
                    selectedTicket.userId === user.id &&
                    !records.find(
                        (r: ZendeskTicket) => r.id === selectedTicket.id
                    )
                ) {
                    records = [selectedTicket, ...records];
                }
                let cached = [];
                if (engageInfo.uii) {
                    cached = (cacheTickets.get(engageInfo.uii) || []).filter(
                        (li: ZendeskTicket & { timeStamp: number }) =>
                            li.userId === user.id &&
                            !records.find(
                                (r: ZendeskTicket) => r.id === li.id
                            ) &&
                            li.timeStamp > Date.now() - TICKET_CACHE_TIME
                    );
                }
                const newTickets = [
                    ...cached.map((li: ZendeskTicket) => ({
                        id: li.id,
                        subject: li.subject,
                    })),
                    ...records,
                ];

                setMatchedTickets(newTickets);
                if (
                    !newTickets.find(
                        (li) => li.id === formDataRef.current.ticket?.id
                    )
                ) {
                    // Clear selection when selected ticket is no longer valid.
                    handleSelectTicket('');
                }
                setTicketQueryState(
                    getCompletedTicketQueryState(
                        requestSeq,
                        requestedUserId,
                        newTickets.length
                    )
                );
            } catch (error) {
                console.error('get tickets error', error);
            }
        },
        [
            CrmSvc,
            engageInfo.uii,
            formDataRef,
            handleSelectTicket,
            selectedTicket,
        ]
    );

    useEffect(() => {
        const currentUser = formData.user;
        const currentUserId = currentUser?.id;
        if (currentUserId && currentUser) {
            autoCreateAttemptedUserIdRef.current = null;
            getTickets(currentUser);
        } else if (currentUser) {
            // User object exists but user id is empty: reset ticket-related state.
            ticketRequestSeqRef.current += 1;
            autoCreateAttemptedUserIdRef.current = null;
            handleSelectTicket('');
            setMatchedTickets([]);
            setTicketQueryState(EMPTY_TICKET_QUERY_STATE);
        }
    }, [formData.user, formData.user?.id, getTickets, handleSelectTicket]);

    useEffect(() => {
        const currentUserId = formData?.user?.id;
        const isAutoCreateSupportedScene =
            (engageType === ParamsType.Call && engageInfo?.agentSessionId) ||
            (engageType === ParamsType.DIGITAL && isDigitalLogVisible);
        const isTicketQuerySettledForCurrentUser =
            Boolean(currentUserId) &&
            ticketQueryState.querySeq === ticketRequestSeqRef.current &&
            ticketQueryState.completed &&
            ticketQueryState.userId === currentUserId &&
            ticketQueryState.ticketCount === 0;
        const hasNotAttemptedAutoCreateForCurrentUser =
            autoCreateAttemptedUserIdRef.current !== currentUserId;
        const shouldAutoCreateTicket =
            isAutoCreateSupportedScene &&
            isTicketQuerySettledForCurrentUser &&
            hasNotAttemptedAutoCreateForCurrentUser &&
            !isSearchDetailOpen;
        if (shouldAutoCreateTicket) {
            autoCreateAttemptedUserIdRef.current = currentUserId || null;
            const autoCreateTicket = async () => {
                const createdTicket = await createTicket(
                    AUTO_CREATE_TICKET_REASON
                );
                // Ensure auto-created ticket still belongs to current selected user.
                if (
                    createdTicket &&
                    createdTicket.userId === formData.user?.id
                ) {
                    setMatchedTickets([createdTicket]);
                    handleSelectTicket(createdTicket.id);
                }
            };
            autoCreateTicket();
        }
    }, [
        engageInfo?.agentSessionId,
        formData?.user?.id,
        ticketQueryState.completed,
        ticketQueryState.querySeq,
        ticketQueryState.userId,
        ticketQueryState.ticketCount,
        engageType,
        isSearchDetailOpen,
        isDigitalLogVisible,
        createTicket,
        handleSelectTicket,
    ]);

    return {
        matchedTickets,
        handleCreateTicket,
    };
}
