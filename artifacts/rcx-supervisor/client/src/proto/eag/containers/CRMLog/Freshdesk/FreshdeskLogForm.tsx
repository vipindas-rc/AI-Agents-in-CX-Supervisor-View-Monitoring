import type { FC } from 'react';
import { useMemo, useEffect, useState, useContext } from 'react';

import { useTranslation } from 'react-i18next';

import { cacheTickets } from './cache';
import { RecordType, NAME_FIELD, NAME_FIELD_FRESHSERVICE } from './constants';
import { StyledLinkButton } from './FreshdeskLogForm.styled';
import { useCreateFieldTransform } from './hooks/useCreateFieldTransform';
import { useEngageInfoChanged } from './hooks/useEngageInfoChanged';
import { useIconCreator } from './hooks/useIconCreator';
import type {
    IFreshdeskLogFormProps,
    FreshdeskTicket,
    CachedTicket,
} from './types';
import { DataTrackingEventNames } from '../../../components/CRM/constants';
import { useAngularModule } from '../../../components/CRM/Hooks/useAngularModule';
import { useCreateFields } from '../../../components/CRM/Hooks/useCreateFields';
import { useDataTracking } from '../../../components/CRM/Hooks/useDataTracking';
import {
    CRMLogForm,
    CRMMatchField,
    CRMSubjectField,
    CRMMatchSelect,
    CRMFormField,
    CRMPhoneEmailFields,
} from '../../../components/CRM/LogForm';
import type { MatchItem } from '../../../components/CRM/types';
import { CRMPlatform } from '../../../constants/crm';
import {
    CRM_SELECT_USER,
    CRM_CREATE_TICKET,
    CRM_USER_MATCHED_LABEL,
} from '../../../constants/testIds';
import injector from '../../../helpers/injector';
import { LogKindContext, LogKindType } from '../../../helpers/logKind';

export const FreshdeskLogForm: FC<IFreshdeskLogFormProps> = ({
    disabled,
    matchedUsers,
    hyperlinkType,
    selectSize = 'small',
    formData,
    engageInfo,
    onFormDataChanged,
    resetHyperlinkType,
    engageType,
    onEngageInfoChanged,
    isLoading,
}) => {
    const [matchedTickets, setMatchedTickets] = useState<FreshdeskTicket[]>([]);
    const iconCreator = useIconCreator();
    const CrmSvc = useAngularModule('CrmSvc');
    const { t } = useTranslation();
    const logKind = useContext(LogKindContext);
    const isChat = logKind?.logKindType === LogKindType.DIGITAL;
    const isFreshservice =
        CrmSvc?.integrateInfo?.platform === CRMPlatform.Freshservice;
    const platformKey = isFreshservice ? 'FRESHSERVICE' : 'FRESHDESK';

    useDataTracking({
        isMatched: !isLoading,
        peopleMatchedItems: matchedUsers,
    });

    useEngageInfoChanged(formData, matchedUsers, onEngageInfoChanged);

    const { createFields, handleCreateRecord } = useCreateFields(
        isFreshservice ? NAME_FIELD_FRESHSERVICE : NAME_FIELD,
        engageInfo
    );

    const matchedTicketsData = useMemo(() => {
        return matchedTickets.map(({ id, subject, url }: FreshdeskTicket) => ({
            id,
            name: `#${id} ${subject}`,
            url,
        }));
    }, [matchedTickets]);

    const selectedUser = useMemo(() => {
        if (!formData.user || !formData.user.id) {
            return [];
        }
        return [formData.user];
    }, [formData.user]);

    const getUserFieldValues = useMemo(() => {
        const getDefaultValues = () => ({
            phone: '',
            email: '',
            isPhoneDisabled: false,
            isEmailDisabled: false,
            hasPhoneError: formData.hasPhoneError || false,
            hasEmailError: formData.hasEmailError || false,
            phoneErrorType: formData.phoneErrorType || '',
            emailErrorType: formData.emailErrorType || '',
        });

        const handleSingleMatchedUser = () => {
            const user = matchedUsers[0];
            return {
                phone: user.work_phone_number || formData.phone || '',
                email: user.primary_email || formData.email || '',
                isPhoneDisabled: !!user.work_phone_number,
                isEmailDisabled: !!user.primary_email,
                hasPhoneError: formData.hasPhoneError || false,
                hasEmailError: formData.hasEmailError || false,
                phoneErrorType: formData.phoneErrorType || '',
                emailErrorType: formData.emailErrorType || '',
            };
        };

        const handleSelectedUserOnly = (user: MatchItem) => ({
            phone: user?.phone || formData.phone || '',
            email: user?.email || formData.email || '',
            isPhoneDisabled:
                !!user?.phone ||
                (!formData.isPhoneManualEdited && !!formData.phone),
            isEmailDisabled:
                !!user?.email ||
                (!formData.isEmailManualEdited && !!formData.email),
            hasPhoneError: formData.hasPhoneError || false,
            hasEmailError: formData.hasEmailError || false,
            phoneErrorType: formData.phoneErrorType || '',
            emailErrorType: formData.emailErrorType || '',
        });

        const handleMultipleMatchedUsers = () => {
            const selectedMatchedUser = matchedUsers.find(
                (user) => user.id === selectedUser[0].id
            );

            if (selectedMatchedUser) {
                return {
                    phone:
                        selectedMatchedUser.work_phone_number ||
                        formData.phone ||
                        '',
                    email:
                        selectedMatchedUser.primary_email ||
                        formData.email ||
                        '',
                    isPhoneDisabled: !!selectedMatchedUser.work_phone_number,
                    isEmailDisabled: !!selectedMatchedUser.primary_email,
                    hasPhoneError: formData.hasPhoneError || false,
                    hasEmailError: formData.hasEmailError || false,
                    phoneErrorType: formData.phoneErrorType || '',
                    emailErrorType: formData.emailErrorType || '',
                };
            } else {
                return handleSelectedUserOnly(selectedUser[0]);
            }
        };

        const handleNoSelectedUser = () => {
            const autoPhone =
                engageInfo.segmentContext?.customerIdentity?.homePhone ||
                engageInfo.segmentContext?.customerIdentity?.mobilePhone ||
                '';
            const autoEmail =
                engageInfo.segmentContext?.customerIdentity?.email || '';

            const hasPhoneError = !autoPhone && !autoEmail;
            const hasEmailError = !autoPhone && !autoEmail;
            const phoneErrorType = hasPhoneError ? 'REQUIRED' : '';
            const emailErrorType = hasEmailError ? 'REQUIRED' : '';

            return {
                phone: formData?.isPhoneManualEdited
                    ? formData.phone || ''
                    : autoPhone || formData.phone || '',
                email: formData?.isEmailManualEdited
                    ? formData.email || ''
                    : autoEmail || formData.email || '',
                isPhoneDisabled: !formData?.isPhoneManualEdited && !!autoPhone,
                isEmailDisabled: !formData?.isEmailManualEdited && !!autoEmail,
                hasPhoneError: formData?.hasPhoneError || hasPhoneError,
                hasEmailError: formData?.hasEmailError || hasEmailError,
                phoneErrorType: formData?.phoneErrorType || phoneErrorType,
                emailErrorType: formData?.emailErrorType || emailErrorType,
            };
        };

        if (!isChat || !isFreshservice) {
            return getDefaultValues();
        }

        if (
            matchedUsers.length === 0 &&
            formData.user?.id === selectedUser[0]?.id &&
            selectedUser.length === 1
        ) {
            return handleSelectedUserOnly(selectedUser[0]);
        }

        if (matchedUsers.length === 1 && selectedUser.length === 1) {
            if (selectedUser[0].id === matchedUsers[0].id) {
                return handleSingleMatchedUser();
            }
            return handleSelectedUserOnly(selectedUser[0]);
        }

        if (matchedUsers.length > 1 && selectedUser.length === 1) {
            return handleMultipleMatchedUsers();
        }

        if (selectedUser.length === 0) {
            return handleNoSelectedUser();
        }

        return getDefaultValues();
    }, [
        isChat,
        isFreshservice,
        matchedUsers,
        selectedUser,
        formData,
        engageInfo,
    ]);

    const { transformedFields } = useCreateFieldTransform({
        createFields,
        isChat,
        isFreshservice,
        getUserFieldValues,
    });

    const handleFormDataChanged = (val: any) => {
        const userVal = val.user;
        let user = formData.user;
        let email = formData.email;
        let phone = formData.phone;
        let hasPhoneError = formData.hasPhoneError;
        let hasEmailError = formData.hasEmailError;
        let phoneErrorType = formData.phoneErrorType;
        let emailErrorType = formData.emailErrorType;

        if (userVal) {
            if (Array.isArray(userVal)) {
                user = {
                    id: userVal[0]?.id || '',
                    name: userVal[0]?.name || '',
                    type: userVal[0]?.type || '',
                    phone:
                        userVal[0]?.phone ||
                        userVal[0]?.work_phone_number ||
                        '',
                    email: userVal[0]?.email || userVal[0]?.primary_email || '',
                };
                if (!formData.isEmailManualEdited) {
                    email = userVal[0]?.email || '';
                }
                if (!formData.isPhoneManualEdited) {
                    phone = userVal[0]?.phone || '';
                }
            } else {
                user = userVal;
                if (!formData.isEmailManualEdited) {
                    email = userVal.email || '';
                }
                if (!formData.isPhoneManualEdited) {
                    phone = userVal.phone || '';
                }
            }
        }

        if (val.email !== undefined) {
            email = val.email;
        }
        if (val.phone !== undefined) {
            phone = val.phone;
        }

        if (val.hasPhoneError !== undefined) hasPhoneError = val.hasPhoneError;
        if (val.hasEmailError !== undefined) hasEmailError = val.hasEmailError;
        if (val.phoneErrorType !== undefined)
            phoneErrorType = val.phoneErrorType;
        if (val.emailErrorType !== undefined)
            emailErrorType = val.emailErrorType;

        const newFormData = {
            ...formData,
            ...val,
            user,
            email,
            phone,
            hasPhoneError,
            hasEmailError,
            phoneErrorType,
            emailErrorType,
            isEmailManualEdited:
                val.isEmailManualEdited !== undefined
                    ? val.isEmailManualEdited
                    : val.email !== undefined
                      ? true
                      : formData.isEmailManualEdited,
            isPhoneManualEdited:
                val.isPhoneManualEdited !== undefined
                    ? val.isPhoneManualEdited
                    : val.phone !== undefined
                      ? true
                      : formData.isPhoneManualEdited,
        };
        onFormDataChanged(newFormData);
    };

    const handleCloseSearchDetail = () => {
        resetHyperlinkType?.();
    };

    const handleSelectTicket = (ticketId: string) => {
        onFormDataChanged({ ...formData, ticket: { id: ticketId } });
    };

    useEffect(() => {
        onFormDataChanged(formData);
        if (
            disabled ||
            isLoading ||
            (formData?.user && formData?.user?.id !== undefined)
        ) {
            return;
        }
        // to see whether it's first single match rather user's operate
        if (matchedUsers.length === 1) {
            if (isChat && isFreshservice) {
                const user = matchedUsers[0];
                onFormDataChanged({
                    user,
                    phone: user.work_phone_number || '',
                    email: user.primary_email || '',
                });
            } else {
                onFormDataChanged({
                    user: matchedUsers[0],
                });
            }
        } else if (matchedUsers.length > 1) {
            const currentUser = matchedUsers.find((user) => user.isCurrent);
            if (currentUser) {
                if (isChat && isFreshservice) {
                    onFormDataChanged({
                        user: currentUser,
                        phone: currentUser.work_phone_number || '',
                        email: currentUser.primary_email || '',
                    });
                } else {
                    onFormDataChanged({ user: currentUser });
                }
            }
        }
    }, [
        isLoading,
        matchedUsers,
        disabled,
        formData?.user?.id,
        onFormDataChanged,
        formData,
        isChat,
        isFreshservice,
    ]);

    const handleCreateUser = async () => {
        const userEngageInfo = {
            ...engageInfo,
            phone: formData.phone || getUserFieldValues.phone,
            email: formData.email || getUserFieldValues.email,
        };

        handleCreateRecord(
            RecordType.User,
            undefined,
            userEngageInfo,
            (user: MatchItem) => {
                onFormDataChanged({
                    ...formData,
                    user,
                    phone: userEngageInfo.phone || '',
                    email: userEngageInfo.email || '',
                    isPhoneManualEdited: false,
                    isEmailManualEdited: false,
                });
            }
        );
    };

    const handleCreateTicket = async () => {
        const AnalyticsSvc = injector('AnalyticsSvc');
        AnalyticsSvc.track(DataTrackingEventNames.RCXMatchCreate, {
            method: logKind?.logKindType,
            type: RecordType.Ticket,
        });

        if (!engageInfo.freshdeskLogInfo) {
            engageInfo.freshdeskLogInfo = {
                user: selectedUser[0] || formData.user || null,
                phone: formData.phone || '',
                email: formData.email || '',
            };
        }

        const result = await CrmSvc.createRecord({
            type: RecordType.Ticket,
            call: engageInfo,
        });

        const { success, data } = result;

        if (success && data) {
            const newTicket: FreshdeskTicket = {
                id: data.id || data.ticketId,
                subject: data.subject,
                userId: formData.user?.id,
                isManuallyCreated: true,
            };

            setMatchedTickets((prevTickets) => [newTicket, ...prevTickets]);

            const cached = cacheTickets.get(engageInfo.uii) || [];
            const ticketToCache: CachedTicket = {
                ...newTicket,
                isManuallyCreated: true,
            };
            cacheTickets.set(engageInfo.uii, [...cached, ticketToCache]);

            if (newTicket.id) {
                handleSelectTicket(newTicket.id);
                onFormDataChanged({
                    ...formData,
                    ticket: newTicket,
                    isTicketManuallyCreated: true,
                });
            }
        }
    };

    const getTickets = async (user: MatchItem | null) => {
        if (!user && !formData.isTicketManuallyCreated) {
            setMatchedTickets([]);
            return;
        }

        const result = await CrmSvc.matchTickets({
            contactId: user?.id,
        });

        const cached = (cacheTickets.get(engageInfo.uii) ||
            []) as CachedTicket[];
        const filteredCached = cached.filter((ticket: CachedTicket) => {
            const isInResults = result.find(
                (r: FreshdeskTicket) => r.id === ticket.id
            );
            if (isInResults) return false;
            return ticket.isManuallyCreated && ticket.userId === user?.id;
        });

        const newTickets = [
            ...filteredCached.map((ticket: CachedTicket) => ({
                id: ticket.id,
                subject: ticket.subject,
                userId: ticket.userId,
                isManuallyCreated: ticket.isManuallyCreated,
            })),
            ...result,
        ];

        setMatchedTickets(newTickets);

        if (!newTickets.find((ticket) => ticket.id === formData.ticket?.id)) {
            handleSelectTicket('');
        }
    };

    useEffect(() => {
        if (formData?.user?.id || formData.isTicketManuallyCreated) {
            getTickets(formData.user || null);
        } else if (formData?.user === null) {
            const cached = (cacheTickets.get(engageInfo.uii) ||
                []) as CachedTicket[];
            const manuallyCreatedTickets = cached.filter(
                (ticket: CachedTicket) => ticket.isManuallyCreated
            );
            setMatchedTickets(manuallyCreatedTickets);
        }
    }, [formData.user, formData.user?.id, formData.isTicketManuallyCreated]);

    useEffect(() => {
        if (engageInfo.uii) {
            engageInfo.freshdeskLogInfo = {
                ...formData,
                displayName: formData?.user?.id && formData?.user?.name,
                phone: getUserFieldValues.phone,
                email: getUserFieldValues.email,
                hasPhoneError: getUserFieldValues.hasPhoneError,
                hasEmailError: getUserFieldValues.hasEmailError,
                phoneErrorType: getUserFieldValues.phoneErrorType,
                emailErrorType: getUserFieldValues.emailErrorType,
            };
        }
    }, [formData, engageInfo.uii, getUserFieldValues]);

    return (
        <CRMLogForm
            disabled={disabled}
            onFormDataChanged={handleFormDataChanged}
            formData={formData}
        >
            <CRMSubjectField value={formData.subject} />
            <CRMMatchField
                label={t(`CRM.${platformKey}.USER`)}
                placeholder={t(`CRM.${platformKey}.USER_SELECT_PLACEHOLDER`)}
                searchType='name'
                formDataKey='user'
                autoPopSearchDetail={!!hyperlinkType}
                selectedItems={selectedUser}
                matchedItems={matchedUsers}
                platFormTranslateKey={platformKey}
                createFields={transformedFields}
                iconCreator={iconCreator}
                onCreateRecord={handleCreateUser}
                onCloseSearchDetail={handleCloseSearchDetail}
                tipAid={CRM_USER_MATCHED_LABEL}
                fieldAid={CRM_SELECT_USER}
            />
            {formData.user?.id && (
                <CRMFormField
                    label={t(`CRM.${platformKey}.TICKET`)}
                    action={
                        !disabled ? (
                            <StyledLinkButton
                                underline='always'
                                title={t(`CRM.${platformKey}.NEW_TICKET`)}
                                onClick={handleCreateTicket}
                                data-aid={CRM_CREATE_TICKET}
                                disabled={!engageInfo.uii}
                            />
                        ) : null
                    }
                >
                    <CRMMatchSelect
                        type={RecordType.Ticket}
                        listData={matchedTicketsData}
                        platFormTranslateKey={platformKey}
                        size={selectSize}
                    />
                </CRMFormField>
            )}
            {isChat && isFreshservice && (
                <CRMPhoneEmailFields
                    phone={getUserFieldValues.phone}
                    email={getUserFieldValues.email}
                    isPhoneDisabled={getUserFieldValues.isPhoneDisabled}
                    isEmailDisabled={getUserFieldValues.isEmailDisabled}
                    hasPhoneError={getUserFieldValues.hasPhoneError}
                    hasEmailError={getUserFieldValues.hasEmailError}
                    phoneErrorType={getUserFieldValues.phoneErrorType}
                    emailErrorType={getUserFieldValues.emailErrorType}
                    onFormDataChanged={handleFormDataChanged}
                />
            )}
        </CRMLogForm>
    );
};
