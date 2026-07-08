import { useState, useCallback, useRef } from 'react';

import { UserService } from '@ringcx/shared';
import { isAxiosError, isCancel } from 'axios';
import { useTranslation } from 'react-i18next';

import type {
    GetContactProfileRequestData,
    ContactsInfo,
    ExternalData,
} from '../../../common/services/transport';
import {
    CANCEL_DUPLICATED_REQUEST_FLAG,
    getContactProfile,
    getExternalContactProfile,
} from '../../../common/services/transport';
import { delay } from '../../../helpers/utils';
import {
    NO_FOUND_CONTACT_ERROR_CODE,
    NO_FOUND_ACTIVITY_ERROR_CODE,
    MAX_RETRIES,
    RETRY_DELAY_MS,
} from '../ContactProfile/constants';
import type { GetContactErrorResponse } from '../ContactProfile/types';
import { ContactType } from '../types';

type useGetProfileProps = {
    AgentSvc: any;
    activityId: string;
    phoneNumber: string;
    isActivityIdUseless: boolean;
    externalData?: ExternalData | Record<string, unknown>;
    isHistoryPage: boolean;
};

export const useGetProfile = ({
    AgentSvc,
    activityId,
    phoneNumber,
    isActivityIdUseless,
    externalData,
    isHistoryPage,
}: useGetProfileProps) => {
    const [error, setError] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [profile, setProfile] = useState<ContactsInfo | null | ExternalData>(
        null
    );
    const [contactType, setContactType] = useState<ContactType>(
        ContactType.UnknownContact
    );
    const externalDataRef = useRef(externalData);
    const { t } = useTranslation();
    const fullUserDetails = UserService.getFullUserDetails();
    const rcAccountId = fullUserDetails.rcAccountId || '';
    const rcxSubAccountId = AgentSvc.agentSettings.accountId || '';

    const getProfile = useCallback(async () => {
        setError('');
        setIsLoading(true);
        setProfile(null);
        setContactType(ContactType.UnknownContact);

        const fetchWithRetry = async (attempt: number): Promise<void> => {
            try {
                const params: GetContactProfileRequestData = isActivityIdUseless
                    ? {
                          kind: 'Phone',
                          value: phoneNumber,
                      }
                    : {
                          activityId,
                      };
                params.cancelDuplicatedRequest = CANCEL_DUPLICATED_REQUEST_FLAG;
                const profileResponse = await getContactProfile({
                    accountId: rcAccountId,
                    params,
                    rcxSubAccountId,
                });
                setError('');
                setProfile(profileResponse);
                setContactType(ContactType.KnownContact);
                setIsLoading(false);
            } catch (e: unknown) {
                if (isCancel(e)) {
                    return;
                }

                const commonErrorMessage = t('GENERICS.MESSAGES.ERROR');

                if (isAxiosError<GetContactErrorResponse>(e)) {
                    const { errorCode, message = commonErrorMessage } =
                        e.response?.data.errors?.[0] || {};

                    if (errorCode === NO_FOUND_CONTACT_ERROR_CODE) {
                        setContactType(ContactType.UnknownContact);
                        setIsLoading(false);
                        return;
                    }

                    if (
                        errorCode === NO_FOUND_ACTIVITY_ERROR_CODE &&
                        attempt < MAX_RETRIES
                    ) {
                        await delay(RETRY_DELAY_MS);
                        return fetchWithRetry(attempt + 1);
                    }

                    setError(message);
                    setIsLoading(false);
                    return;
                }

                setError(commonErrorMessage);
                setIsLoading(false);
            }
        };

        await fetchWithRetry(0);
    }, [
        activityId,
        phoneNumber,
        rcAccountId,
        rcxSubAccountId,
        t,
        isActivityIdUseless,
    ]);

    const getExternalProfile = useCallback(
        async ({ externalId }: { externalId: string }) => {
            try {
                if (!isHistoryPage) {
                    setProfile(externalDataRef.current as ExternalData);
                    return;
                }
                const params = {
                    id: externalId,
                };
                const profileResponse = await getExternalContactProfile({
                    accountId: rcAccountId,
                    params,
                    rcxSubAccountId,
                });
                setProfile(profileResponse);
            } catch {
                setError(t('GENERICS.MESSAGES.ERROR'));
            } finally {
                setIsLoading(false);
            }
        },
        [isHistoryPage, rcAccountId, rcxSubAccountId, t]
    );

    return {
        error,
        isLoading,
        contactType,
        profile,
        getProfile,
        getExternalProfile,
    };
};
