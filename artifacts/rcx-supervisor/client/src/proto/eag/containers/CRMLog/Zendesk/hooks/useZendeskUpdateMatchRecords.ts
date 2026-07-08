import {
    useEffect,
    useCallback,
    useState,
    useRef,
    useLayoutEffect,
} from 'react';

import { useAngularModule } from '../../../../components/CRM/Hooks/useAngularModule';
import type { MatchItem } from '../../../../components/CRM/types';
import { CRM_ACTIONS } from '../../../../constants/crm';
import { crmEventBus } from '../../../../helpers/crmEventBus';
import { RecordType } from '../constants';
import type { IZendeskLogFormData, ZendeskTicket } from '../types';

interface UpdatedCallMatchRecordsData {
    uii: string;
    lastCreatedUser?: MatchItem;
    lastCreatedTicket?: ZendeskTicket;
    records?: MatchItem[];
}

interface PartitionedRecords {
    matchedUsers: MatchItem[];
    recentlyCreatedUser?: MatchItem;
    matchedTicket?: MatchItem;
}

function toZendeskTicket(ticket?: MatchItem): ZendeskTicket | undefined {
    if (!ticket) {
        return undefined;
    }

    return {
        id: ticket.id || '',
        subject: ticket.name,
        userId: ticket.userId,
        url: ticket.url || '',
    };
}

function partitionRecords(records: MatchItem[]): PartitionedRecords {
    const matchedUsers: MatchItem[] = [];
    let recentlyCreatedUser: MatchItem | undefined;
    let matchedTicket: MatchItem | undefined;

    for (const item of records) {
        if (item.type === RecordType.User) {
            matchedUsers.push(item);
            if (item.recentlyCreated) {
                recentlyCreatedUser = item;
            }
        } else if (item.type === RecordType.Ticket) {
            matchedTicket = item;
        }
    }

    return { matchedUsers, recentlyCreatedUser, matchedTicket };
}

/**
 * @description Update the matched users when CRM adapter sends updated match records after creating new records
 * @param uii - Unique interaction identifier
 * @param formData - Current form data
 * @param enabled - Whether the hook is enabled
 * @param handleFormDataChanged - Callback to update form data
 */
export function useZendeskUpdateMatchRecords(
    uii: string,
    formData: IZendeskLogFormData,
    enabled: boolean,
    handleFormDataChanged: (formData: IZendeskLogFormData) => void
) {
    const CrmSvc = useAngularModule('CrmSvc');
    const handleFormDataChangedRef = useRef(handleFormDataChanged);
    const formDataRef = useRef(formData);

    useEffect(() => {
        handleFormDataChangedRef.current = handleFormDataChanged;
    }, [handleFormDataChanged]);

    useEffect(() => {
        formDataRef.current = formData;
    }, [formData]);

    const [updatedMatchedUsers, setUpdatedMatchedUsers] = useState<MatchItem[]>(
        []
    );
    const [isRecordUpdated, setIsRecordUpdated] = useState(false);
    const [updatedTicket, setUpdatedTicket] = useState<ZendeskTicket>();

    const handler = useCallback(
        (data: UpdatedCallMatchRecordsData) => {
            if (!enabled) {
                return;
            }

            if (data.uii !== uii) {
                return;
            }

            const { matchedUsers, recentlyCreatedUser, matchedTicket } =
                partitionRecords(data.records || []);

            setIsRecordUpdated(true);

            const currentFormData = formDataRef.current;
            const currentUser = currentFormData?.user;
            const currentTicket = currentFormData?.ticket;

            const isUserIdChanged = Boolean(
                recentlyCreatedUser &&
                    recentlyCreatedUser.id !== currentUser?.id
            );
            const isUserNameChanged = Boolean(
                recentlyCreatedUser &&
                    recentlyCreatedUser.name !== currentUser?.name
            );
            const shouldUpdateUser = isUserIdChanged || isUserNameChanged;
            const nextUser = shouldUpdateUser
                ? recentlyCreatedUser
                : currentUser;
            const shouldClearTicket = isUserIdChanged;

            const shouldUpdateTicket =
                matchedTicket &&
                nextUser?.id &&
                matchedTicket.userId === nextUser.id &&
                matchedTicket.id !== currentTicket?.id;

            setUpdatedMatchedUsers(matchedUsers);

            let nextFormData: IZendeskLogFormData = currentFormData;
            let shouldCommitFormData = false;

            if (shouldUpdateUser || shouldClearTicket) {
                nextFormData = {
                    ...currentFormData,
                    ...(shouldUpdateUser ? { user: recentlyCreatedUser } : {}),
                    ...(shouldClearTicket ? { ticket: undefined } : {}),
                };
                shouldCommitFormData = true;
            }

            const nextTicket = shouldUpdateTicket
                ? toZendeskTicket(matchedTicket)
                : undefined;
            setUpdatedTicket((updatedTicketPrev) => {
                if (nextTicket) {
                    return nextTicket;
                }

                return shouldClearTicket ? undefined : updatedTicketPrev;
            });

            if (nextTicket) {
                nextFormData = {
                    ...nextFormData,
                    ticket: nextTicket,
                };
                shouldCommitFormData = true;
            }

            if (shouldCommitFormData) {
                handleFormDataChangedRef.current(nextFormData);
            }

            CrmSvc?.setUpdatedCallMatchRecords(uii, {
                records: undefined,
                lastCreatedUser: recentlyCreatedUser,
                lastCreatedTicket: matchedTicket,
            });
        },
        [uii, CrmSvc, enabled]
    );

    const handlerRef = useRef(handler);
    useLayoutEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const eventHandler = (data: UpdatedCallMatchRecordsData) =>
            handlerRef.current(data);

        crmEventBus.on(CRM_ACTIONS.UPDATE_MATCHING_RECORDS, eventHandler);
        return () => {
            crmEventBus.off(CRM_ACTIONS.UPDATE_MATCHING_RECORDS, eventHandler);
        };
    }, []);

    useEffect(() => {
        const existingData = CrmSvc?.updatedCallMatchRecords?.[uii];
        if (existingData?.records) {
            handlerRef.current(existingData);
        }
    }, [uii, CrmSvc]);

    const resetIsRecordUpdated = useCallback(() => {
        setIsRecordUpdated(false);
    }, []);

    return {
        updatedMatchedUsers,
        updatedTicket,
        isRecordUpdated,
        resetIsRecordUpdated,
    };
}
