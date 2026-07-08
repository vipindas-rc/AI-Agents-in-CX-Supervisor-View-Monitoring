import { useEffect, useState } from 'react';

import { Button } from '@ringcentral/spring-ui';
import { isEmail, parsePhoneNumber } from '@ringcx/shared';
import { isAxiosError } from 'axios';
import _ from 'lodash';
import { useForm, FormProvider, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
    defaultProfileForm,
    editContactTrackSourceMap,
    multiContactItems,
} from './constants';
import { ProfileForm } from './ProfileForm';
import type { ProfileFormType, TagOption } from './types';
import {
    createContactProfile,
    updateActivity,
    type CreateContactProfileRequestData,
} from '../../../common/services/transport';
import { CONTACT_MANAGEMENT_CREATE_NEW_CONTACT } from '../../../constants/testIds';
import { formatContactProfileData } from '../../../helpers/contactManagement';
import injector from '../../../helpers/injector';
import { ContactHeader } from '../components/ContactHeader';
import { useHandleDuplicatedIdentifierError } from '../hooks/useHandleDuplicatedIdentifierError';
import { CustomerType, type PageType } from '../types';

type CreateNewProfileProps = {
    tags: TagOption[];
    activityId?: string;
    rcAccountId: string;
    rcxSubAccountId: string;
    updateIsShowCreateNewContact: (value: boolean) => void;
    reloadContactProfile: () => void;
    section: PageType;
    isCellPhoneOrEmailMandatory: boolean;
    isActivityIdUseless: boolean;
};

export const CreateNewContact = ({
    tags,
    activityId,
    rcAccountId,
    rcxSubAccountId,
    updateIsShowCreateNewContact,
    reloadContactProfile,
    section,
    isCellPhoneOrEmailMandatory,
    isActivityIdUseless,
}: CreateNewProfileProps) => {
    const AnalyticsSvc = injector('AnalyticsSvc');
    const SessionSvc = injector('SessionSvc');
    const { t } = useTranslation();
    const { getValues } = useFormContext();
    const { handleDuplicatedIdentifierError } =
        useHandleDuplicatedIdentifierError({
            section,
            type: CustomerType.UnknownCustomer,
        });
    const [isCellPhoneOrEmailEmpty, setIsCellPhoneOrEmailEmpty] =
        useState(false);
    const isI18nEnabled = SessionSvc.isI18nEnabled();

    useEffect(() => {
        AnalyticsSvc.track('View RCX_agent_contactInfo page', {
            type: CustomerType.UnknownCustomer,
            section,
        });
    }, [section]);

    const growl = injector('growl');
    const getDefaultValues = () => {
        const formValues = _.cloneDeep(defaultProfileForm);
        const kind = getValues('kind');
        const value = getValues('value');
        if (kind === 'Phone') {
            const { value: formattedValue } = parsePhoneNumber(value);
            formValues.MobilePhones.items[0].value = isI18nEnabled
                ? formattedValue
                : value;
        }
        if (kind === 'Email') {
            formValues.Email.items[0].value = value;
        }
        return formValues;
    };
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const methods = useForm({
        defaultValues: getDefaultValues(),
    });

    const { handleSubmit, setError } = methods;

    const handleUpdateError = (e: unknown) => {
        if (!isAxiosError(e)) return;

        const errors = e.response?.data.errors?.[0];
        const errorMessage = errors?.message || errors?.raw_error;

        if (errorMessage) {
            growl.error(errorMessage);
        }
    };

    const trackEditProfile = (data: any[]) => {
        const contactProfileData = formatContactProfileData(data);

        for (const item in contactProfileData) {
            const source =
                editContactTrackSourceMap[
                    item as keyof typeof editContactTrackSourceMap
                ];
            if (multiContactItems.includes(contactProfileData[item].kind)) {
                AnalyticsSvc.track('RCX_agent_contactInfo_contactEditSave', {
                    type: CustomerType.UnknownCustomer,
                    section,
                    source,
                    amount: contactProfileData[item].amount,
                });
            } else {
                AnalyticsSvc.track('RCX_agent_contactInfo_contactEditSave', {
                    type: CustomerType.UnknownCustomer,
                    section,
                    source,
                });
            }
        }
    };

    const onSubmit = async (data: ProfileFormType) => {
        const {
            Email: { items: emailItems },
            MobilePhones: { items: mobilePhoneItems },
            HomePhones: { items: homePhoneItems },
            TagIds,
            ...restFields
        } = data;
        if (
            isCellPhoneOrEmailMandatory &&
            [...emailItems, ...mobilePhoneItems].every((item) => !item.value)
        ) {
            setIsCellPhoneOrEmailEmpty(true);
            AnalyticsSvc.track('RCX_agent_contactInfo_error', {
                type: CustomerType.UnknownCustomer,
                section,
                result: 'identifier missed',
            });
            return;
        }
        if (emailItems.length) {
            let hasEmailError = false;
            emailItems.forEach((item, index) => {
                const email = item.value;
                if (!email) {
                    return;
                }
                const isEmailResult = isEmail(email);
                if (!isEmailResult) {
                    AnalyticsSvc.track('RCX_agent_contactInfo_error', {
                        type: CustomerType.UnknownCustomer,
                        section,
                        result: 'invalid email',
                    });
                    setError(`Email.items[${index}]`, {
                        type: 'manual',
                        message: t(
                            'CONTACT_MANAGEMENT.CONTACT_PROFILE.EMAIL_INVALID_ERROR',
                            {
                                email,
                            }
                        ),
                    });
                    hasEmailError = true;
                }
            });
            if (hasEmailError) {
                return;
            }
        }

        let formatMobilePhoneItems = mobilePhoneItems;
        let formatHomePhoneItems = homePhoneItems;
        let hasInvalidPhoneNumber = false;

        const formatPhoneItems = (phoneItems: any[]) => {
            return phoneItems.map((item) => {
                const {
                    value: formattedPhoneNumber,
                    isValid,
                    e164,
                } = parsePhoneNumber(item.value);
                if (!isValid) {
                    hasInvalidPhoneNumber = true;
                }
                return {
                    ...item,
                    value: isValid ? e164 : formattedPhoneNumber,
                };
            });
        };

        if (isI18nEnabled) {
            formatMobilePhoneItems = formatPhoneItems(mobilePhoneItems);
            formatHomePhoneItems = formatPhoneItems(homePhoneItems);

            if (hasInvalidPhoneNumber) {
                growl.error(t('CONTACT_MANAGEMENT.INVALID_PHONE_ERROR'));
                return;
            }

            data.MobilePhones.items = formatMobilePhoneItems;
            data.HomePhones.items = formatHomePhoneItems;
        }
        setIsLoading(true);
        const tagIdsAttribute = {
            ...TagIds,
            value: TagIds.value.map((item) => item.id),
        };

        const attributes = [
            ...emailItems,
            ...formatMobilePhoneItems,
            ...formatHomePhoneItems,
            tagIdsAttribute,
            ...Object.values(restFields),
        ];
        const filteredAttributes = attributes.filter(({ value }) => {
            if (Array.isArray(value)) {
                return value.length !== 0;
            }
            return !!value;
        });
        const trimmedAttributeValue = filteredAttributes.map(
            ({ value, ...restAttributes }) => {
                const trimmedValue =
                    typeof value === 'string' ? value.trim() : value;
                return {
                    ...restAttributes,
                    value: trimmedValue,
                };
            }
        );
        const params: CreateContactProfileRequestData = {
            attributes: trimmedAttributeValue,
        };

        const paramsWithActivityId = {
            activityId,
            attributes: trimmedAttributeValue,
        };

        try {
            const { id } = await createContactProfile({
                accountId: rcAccountId,
                rcxSubAccountId,
                params: isCellPhoneOrEmailMandatory
                    ? params
                    : paramsWithActivityId,
            });
            trackEditProfile(trimmedAttributeValue);

            try {
                if (
                    isCellPhoneOrEmailMandatory &&
                    !isActivityIdUseless &&
                    activityId
                ) {
                    await updateActivity({
                        accountId: rcAccountId,
                        rcxSubAccountId,
                        activityId,
                        params: {
                            contactId: id,
                        },
                    });
                }
            } catch (e) {
                handleUpdateError(e);
            }
            updateIsShowCreateNewContact(false);
            reloadContactProfile();
        } catch (e) {
            handleDuplicatedIdentifierError({
                e,
                data,
                setError,
            });
            setIsLoading(false);
        }
    };

    return (
        <div data-aid={CONTACT_MANAGEMENT_CREATE_NEW_CONTACT}>
            <FormProvider {...methods}>
                <div className='bg-neutral-b5 border-b-neutral-b4-t50 flex h-16 w-full flex-none items-center justify-between border-0 border-b border-solid px-4'>
                    <ContactHeader
                        title={t(
                            'CONTACT_MANAGEMENT.CONTACT_PROFILE.ADD_CONTACT'
                        )}
                    />
                    <div className='space-x-4'>
                        <Button
                            color='secondary'
                            variant='outlined'
                            size='large'
                            disabled={isLoading}
                            onClick={() => updateIsShowCreateNewContact(false)}
                        >
                            {t('CONTACT_MANAGEMENT.CONTACT_PROFILE.CANCEL')}
                        </Button>
                        <Button
                            size='large'
                            loading={isLoading}
                            onClick={handleSubmit(onSubmit)}
                        >
                            {t('CONTACT_MANAGEMENT.CONTACT_PROFILE.CREATE')}
                        </Button>
                    </div>
                </div>
                <ProfileForm
                    tags={tags}
                    isCellPhoneOrEmailEmpty={isCellPhoneOrEmailEmpty}
                    setIsCellPhoneOrEmailEmpty={setIsCellPhoneOrEmailEmpty}
                />
            </FormProvider>
        </div>
    );
};
