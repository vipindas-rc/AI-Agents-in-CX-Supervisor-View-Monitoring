import { useState, useEffect } from 'react';

import { UserService } from '@ringcx/shared';
import { useQuery } from '@tanstack/react-query';
import { useForm, FormProvider } from 'react-hook-form';

import { ContactDetail } from './ContactDetail';
import { CreateNewContact } from './CreateNewContact';
import type { TagOption } from './types';
import { UnknownContact } from './UnknownContact';
import type { ContactsInfo } from '../../../common/services/transport';
import { getAllTags } from '../../../common/services/transport';
import { type PageType, ContactType } from '../types';

type ContactProfileProps = {
    AgentSvc: any;
    activityId?: string;
    phoneNumber?: string;
    profile: ContactsInfo | null;
    getProfile: () => Promise<void>;
    contactType: ContactType;
    section: PageType;
    isCellPhoneOrEmailMandatory?: boolean;
    isActivityIdUseless: boolean;
    isLoading: boolean;
    onLoaded: () => void;
};

export const ContactProfile = ({
    AgentSvc,
    activityId,
    phoneNumber,
    profile,
    getProfile,
    contactType,
    section,
    isCellPhoneOrEmailMandatory = false,
    isActivityIdUseless,
    isLoading,
    onLoaded,
}: ContactProfileProps) => {
    const fullUserDetails = UserService.getFullUserDetails();
    const rcAccountId = fullUserDetails.rcAccountId || '';
    const rcxSubAccountId = AgentSvc.agentSettings.accountId || '';
    const [isShowCreateNewContact, setIsShowCreateNewContact] = useState(false);
    const { data: tags = [], isLoading: isGettingAllTags } = useQuery({
        queryKey: ['getAllTags'],
        queryFn: async (): Promise<TagOption[]> => {
            const tagsRaw = await getAllTags(AgentSvc);
            return tagsRaw.map(({ id, name }) => ({
                id,
                label: name,
            }));
        },
        staleTime: 10 * 60 * 1000,
        retry: 1,
    });

    useEffect(() => {
        if (!isGettingAllTags) {
            onLoaded();
        }
    }, [isGettingAllTags, onLoaded]);

    const methods = useForm({
        defaultValues: {
            kind: 'Phone',
            value: '',
        },
    });

    if (isLoading) {
        return null;
    }

    if (contactType === ContactType.UnknownContact) {
        if (isShowCreateNewContact) {
            return (
                <FormProvider {...methods}>
                    <CreateNewContact
                        tags={tags}
                        activityId={activityId}
                        rcAccountId={rcAccountId}
                        rcxSubAccountId={rcxSubAccountId}
                        updateIsShowCreateNewContact={setIsShowCreateNewContact}
                        reloadContactProfile={getProfile}
                        section={section}
                        isCellPhoneOrEmailMandatory={
                            isCellPhoneOrEmailMandatory
                        }
                        isActivityIdUseless={isActivityIdUseless}
                    />
                </FormProvider>
            );
        }

        return (
            <FormProvider {...methods}>
                <UnknownContact
                    phoneNumber={phoneNumber}
                    activityId={activityId}
                    rcAccountId={rcAccountId}
                    rcxSubAccountId={rcxSubAccountId}
                    updateIsShowCreateNewContact={setIsShowCreateNewContact}
                    reloadContactProfile={getProfile}
                    section={section}
                    isActivityIdUseless={isActivityIdUseless}
                />
            </FormProvider>
        );
    }

    return (
        <ContactDetail
            tags={tags}
            profile={profile as ContactsInfo}
            rcAccountId={rcAccountId}
            rcxSubAccountId={rcxSubAccountId}
            activityId={activityId}
            reloadContactProfile={getProfile}
            section={section}
            isActivityIdUseless={isActivityIdUseless}
        />
    );
};
