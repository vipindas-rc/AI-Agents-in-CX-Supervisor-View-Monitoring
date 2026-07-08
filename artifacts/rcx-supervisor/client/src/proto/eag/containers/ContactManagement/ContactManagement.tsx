import { Fragment, useEffect, useState } from 'react';

import { BlockMd } from '@ringcentral/spring-icon';
import { CircularProgressIndicator, Icon, Text } from '@ringcentral/spring-ui';
import { QueryClientProvider } from '@tanstack/react-query';

import { ContactProfile, ExternalContact } from './ContactProfile';
import { useGetProfile, useCheckExternalContact } from './hooks';
import { HistoryList } from './InteractionHistory';
import { PageType, ContactType } from './types';
import type {
    ContactsInfo,
    ExternalData,
} from '../../common/services/transport';
import { isCellPhoneOrEmailMandatoryPredicate } from '../../helpers/contactManagement';
import translate from '../../helpers/translate';
import { queryClient } from '../../layout/Wrapper/Wrapper';

type ContactManagementProps = {
    AgentSvc: any;
    activityId: string;
    phoneNumber?: string;
    section: PageType;
    channelType: string;
    isActivityIdUseless?: boolean;
    dialogId?: string;
    isCallDetail?: boolean;
    externalData?: ExternalData | Record<string, unknown>;
};

export const ContactManagement = ({
    AgentSvc,
    activityId = '',
    phoneNumber = '',
    section,
    channelType,
    isActivityIdUseless = false,
    dialogId = '',
    isCallDetail = false,
    externalData = {},
}: ContactManagementProps) => {
    const isHistoryPage = section === PageType.History;
    const {
        isCheckingExternalContact,
        isExternalContact,
        externalId,
        checkIsExternalContact,
    } = useCheckExternalContact({
        AgentSvc,
        segmentId: activityId,
        externalData,
        isHistoryPage,
    });

    const {
        getProfile,
        contactType,
        isLoading: isGetProfileLoading,
        error,
        profile,
        getExternalProfile,
    } = useGetProfile({
        AgentSvc,
        activityId,
        phoneNumber,
        isActivityIdUseless,
        isHistoryPage,
        externalData,
    });

    const [isHistoryLoading, setIsHistoryLoading] = useState(true);
    const [isProfileLoading, setIsProfileLoading] = useState(true);

    const isCellPhoneOrEmailMandatory =
        isCellPhoneOrEmailMandatoryPredicate(channelType);

    const showActivityHistory =
        (contactType === ContactType.KnownContact &&
            !!(profile as ContactsInfo)?.id) ||
        !!(profile as ExternalData)?.externalId;

    if (isCheckingExternalContact) {
        checkIsExternalContact();
    }

    useEffect(() => {
        if (!isCheckingExternalContact && isExternalContact) {
            getExternalProfile({ externalId });
            setIsProfileLoading(false);
        }
    }, [
        externalId,
        isCheckingExternalContact,
        isExternalContact,
        getExternalProfile,
    ]);

    useEffect(() => {
        if (
            (isCallDetail && !activityId) ||
            isCheckingExternalContact ||
            isExternalContact
        ) {
            return;
        }
        getProfile();
    }, [
        getProfile,
        activityId,
        isCallDetail,
        isCheckingExternalContact,
        isExternalContact,
    ]);

    if (error) {
        return (
            <div
                className='pb-30 flex flex-1 flex-col items-center justify-center'
                data-aid='error'
            >
                <Icon
                    symbol={BlockMd}
                    className='text-neutral-b3 text-[64px]'
                />
                <Text className='typography-title text-neutral-b1 mb-3 mt-6 w-48 text-center'>
                    {translate('CONTACT_MANAGEMENT.UNAVAILABLE')}
                </Text>
                <Text className='typography-mainText text-neutral-b2 w-48 text-center'>
                    {translate('CONTACT_MANAGEMENT.ERROR_DESCRIPTOR')}
                </Text>
            </div>
        );
    }

    const isLoading =
        isGetProfileLoading ||
        (showActivityHistory && isHistoryLoading) ||
        isProfileLoading;

    const contactDetail = isExternalContact ? (
        <ExternalContact
            isLoading={isLoading}
            externalData={profile as ExternalData}
        />
    ) : (
        <ContactProfile
            activityId={activityId}
            phoneNumber={phoneNumber}
            AgentSvc={AgentSvc}
            getProfile={getProfile}
            contactType={contactType}
            profile={profile as ContactsInfo}
            section={section}
            isCellPhoneOrEmailMandatory={isCellPhoneOrEmailMandatory}
            isActivityIdUseless={isActivityIdUseless}
            isLoading={isLoading}
            onLoaded={() => setIsProfileLoading(false)}
        />
    );

    return (
        <Fragment>
            {isLoading && (
                <div
                    className='flex w-full flex-1 items-center justify-center'
                    data-aid='profile-loading'
                >
                    <CircularProgressIndicator />
                </div>
            )}
            <QueryClientProvider client={queryClient}>
                {!isGetProfileLoading && contactDetail}
                {showActivityHistory && (
                    <HistoryList
                        defaultExpanded
                        contactId={(profile as ContactsInfo)?.id}
                        section={section}
                        highlightDialogId={dialogId}
                        isLoading={isLoading}
                        onLoaded={() => setIsHistoryLoading(false)}
                        isExternalContact={isExternalContact}
                        externalId={externalId}
                    />
                )}
            </QueryClientProvider>
        </Fragment>
    );
};
