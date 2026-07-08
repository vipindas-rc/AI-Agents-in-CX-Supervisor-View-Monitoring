import { useEffect, useState } from 'react';

import { parsePhoneNumber, isEmail } from '@ringcx/shared';
import _ from 'lodash';
import { useForm, FormProvider } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
    defaultProfileForm,
    editContactTrackSourceMap,
    multiContactItems,
    phoneKindLabels,
} from './constants';
import { ProfileForm } from './ProfileForm';
import type { ProfileFormType, TagOption } from './types';
import {
    updateContactProfile,
    updateActivity,
    type AttributesItem,
    type ContactsInfo,
} from '../../../common/services/transport';
import { CONTACT_MANAGEMENT_CONTACT_DETAIL } from '../../../constants/testIds';
import { formatContactProfileData } from '../../../helpers/contactManagement';
import injector from '../../../helpers/injector';
import { ConfirmModal } from '../components/ConfirmModal';
import { ContactAccordion } from '../components/ContactAccordion';
import { useHandleDuplicatedIdentifierError } from '../hooks/useHandleDuplicatedIdentifierError';
import { type PageType, CustomerType } from '../types';

type ProfileDetailProps = {
    tags: TagOption[];
    profile: ContactsInfo;
    rcAccountId: string;
    rcxSubAccountId: string;
    activityId?: string;
    reloadContactProfile: () => void;
    section: PageType;
    isActivityIdUseless: boolean;
};

type StringValueKind =
    | 'FirstName'
    | 'LastName'
    | 'Company'
    | 'Gender'
    | 'Notes';

export const ContactDetail = ({
    tags,
    profile,
    rcAccountId,
    rcxSubAccountId,
    activityId,
    reloadContactProfile,
    section,
    isActivityIdUseless,
}: ProfileDetailProps) => {
    const AnalyticsSvc = injector('AnalyticsSvc');
    const SessionSvc = injector('SessionSvc');
    const growl = injector('growl');
    const { attributes, id } = profile;
    const { t } = useTranslation();
    const { handleDuplicatedIdentifierError } =
        useHandleDuplicatedIdentifierError({
            section,
            type: CustomerType.KnownCustomer,
        });
    const isI18nEnabled = SessionSvc.isI18nEnabled();

    useEffect(() => {
        AnalyticsSvc.track('View RCX_agent_contactInfo page', {
            type: CustomerType.KnownCustomer,
            section,
        });
    }, [section]);
    const getDefaultValues = () => {
        const formValues = _.cloneDeep(defaultProfileForm);
        const kinds = ['Email', 'MobilePhones', 'HomePhones'] as const;

        for (const kind of kinds) {
            const attributesItem = attributes.filter(
                ({ kind: attributeKind, label }) => {
                    const key =
                        attributeKind === 'Email' ? attributeKind : label;
                    return key === kind;
                }
            ) as Exclude<AttributesItem, { kind: 'TagIds' }>[];

            if (phoneKindLabels.includes(kind) && isI18nEnabled) {
                attributesItem.forEach((item) => {
                    const { value } = item;
                    const { value: formattedPhoneNumber } =
                        parsePhoneNumber(value);
                    item.value = formattedPhoneNumber;
                });
            }

            if (attributesItem.length) {
                formValues[kind].items = attributesItem;
            }
        }

        attributes.forEach((attribute) => {
            const { kind } = attribute;

            if (
                [
                    'FirstName',
                    'LastName',
                    'Company',
                    'Gender',
                    'Notes',
                ].includes(kind)
            ) {
                formValues[kind as StringValueKind] = {
                    ...formValues[kind as StringValueKind],
                    ...(attribute as Exclude<
                        AttributesItem,
                        { kind: 'TagIds' }
                    >),
                };
                return;
            }

            if (kind === 'TagIds') {
                formValues[kind as 'TagIds'] = {
                    ...formValues[kind],
                    ...attribute,
                    value: (attribute.value as string[])
                        .map((item) => {
                            const matchTag = tags.find(({ id }) => id === item);
                            return matchTag
                                ? { id: matchTag.id, label: matchTag.label }
                                : undefined;
                        })
                        .filter((item) => item !== undefined) as TagOption[],
                };
                return;
            }
        });

        return formValues;
    };

    const [prevFormValue, setPrevFormValue] =
        useState<ProfileFormType>(getDefaultValues());
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [changeContactErrorMessage, setChangeContactErrorMessage] =
        useState('');
    const [name, setName] = useState('');
    const [subTitle, setSubTitle] = useState('');

    const {
        MobilePhones: { items: mobilePhonesItems },
        Email: { items: emailItems },
    } = prevFormValue;

    const mobilePhoneValue = mobilePhonesItems.find(
        (items) => !!items.value
    )?.value;
    const emailValue = emailItems.find((items) => !!items.value)?.value;

    const {
        FirstName: { value: firstName },
        LastName: { value: lastName },
    } = prevFormValue;

    useEffect(() => {
        let subTitle = mobilePhoneValue || emailValue || '';
        if (mobilePhoneValue) {
            subTitle = parsePhoneNumber(subTitle).value;
        }
        setSubTitle(subTitle);
    }, [emailValue, mobilePhoneValue]);

    useEffect(() => {
        let name = firstName + ' ' + lastName;
        if (name === ' ') {
            name = t('CONTACT_MANAGEMENT.CONTACT_PROFILE.UNKNOWN');
        }
        setName(name);
    }, [firstName, lastName, t]);

    const methods = useForm({
        defaultValues: getDefaultValues(),
    });
    const { setError, getValues } = methods;
    const trackEditProfile = (data: any[]) => {
        const contactProfileData = formatContactProfileData(data);
        for (const item in contactProfileData) {
            const source =
                editContactTrackSourceMap[
                    item as keyof typeof editContactTrackSourceMap
                ];
            if (multiContactItems.includes(contactProfileData[item].kind)) {
                AnalyticsSvc.track('RCX_agent_contactInfo_contactEditSave', {
                    type: CustomerType.KnownCustomer,
                    section,
                    source,
                    amount: contactProfileData[item].amount,
                });
            } else {
                AnalyticsSvc.track('RCX_agent_contactInfo_contactEditSave', {
                    type: CustomerType.KnownCustomer,
                    section,
                    source,
                });
            }
        }
    };
    const onSubmit = (kind: string, index?: number) => async () => {
        const data = getValues();
        if (
            _.isEqual(
                prevFormValue[kind as keyof ProfileFormType],
                data[kind as keyof ProfileFormType]
            )
        ) {
            return;
        }

        if (
            kind === 'Email' &&
            index !== undefined &&
            data.Email.items[index]?.value
        ) {
            const email = data.Email.items[index].value;
            const isEmailResult = isEmail(email);

            if (!isEmailResult) {
                setError(`Email.items[${index}]`, {
                    type: 'manual',
                    message: t(
                        'CONTACT_MANAGEMENT.CONTACT_PROFILE.EMAIL_INVALID_ERROR',
                        { email }
                    ),
                });
                return;
            }
        }

        let changedField;
        changedField = data[kind as keyof ProfileFormType];
        if (kind === 'TagIds') {
            changedField = {
                kind,
                value: changedField.value.map(
                    (item: ProfileFormType['TagIds']) => item.id
                ),
                isIdentifier: changedField.isIdentifier,
            };
        }

        if (['Email', 'HomePhones', 'MobilePhones'].includes(kind)) {
            let isInvalidPhoneNumber = false;
            changedField = data[kind as keyof ProfileFormType].items.map(
                (item: { value: string; [key: string]: any }) => {
                    if (phoneKindLabels.includes(kind) && isI18nEnabled) {
                        const {
                            value: formattedPhoneNumber,
                            isValid,
                            e164,
                        } = parsePhoneNumber(item.value);
                        const newValue = isValid ? e164 : formattedPhoneNumber;

                        if (!isValid) {
                            isInvalidPhoneNumber = true;
                        }

                        return {
                            ...item,
                            value: newValue.trim(),
                        };
                    }
                    return {
                        ...item,
                        value: item.value.trim(),
                    };
                }
            );
            if (isInvalidPhoneNumber) {
                growl.error(t('CONTACT_MANAGEMENT.INVALID_PHONE_ERROR'));
                return;
            }
            data[kind as keyof ProfileFormType].items = changedField;
        }

        try {
            const attributes = changedField.length
                ? changedField
                : [changedField];
            await updateContactProfile({
                accountId: rcAccountId,
                rcxSubAccountId,
                contactId: id,
                params: {
                    attributes,
                },
            });
            trackEditProfile(attributes);
            setPrevFormValue({
                ...prevFormValue,
                [kind]: _.cloneDeep(data[kind as keyof ProfileFormType]),
            });
        } catch (e) {
            handleDuplicatedIdentifierError({ e, data, setError });
        }
    };

    const onChangeContact = async () => {
        AnalyticsSvc.track('RCX_agent_contactInfo_changeContactConfirm', {
            section,
        });
        setIsLoading(true);
        setChangeContactErrorMessage('');

        try {
            await updateActivity({
                accountId: rcAccountId,
                rcxSubAccountId,
                activityId: activityId as string,
                params: {
                    contactId: null,
                },
            });
            setIsOpenModal(false);
            reloadContactProfile();
        } catch (e) {
            setChangeContactErrorMessage(t('GENERICS.MESSAGES.ERROR'));
        }

        setIsLoading(false);
    };

    const handleChangeContactClick = () => {
        AnalyticsSvc.track('RCX_agent_contactInfo_action', {
            type: CustomerType.KnownCustomer,
            section,
            action: 'more - change contact',
        });
        setIsOpenModal(true);
    };

    const menuActions =
        !isActivityIdUseless && activityId
            ? [
                  {
                      id: 'changeProfile',
                      label: t(
                          'CONTACT_MANAGEMENT.CONTACT_PROFILE.CHANGE_CONTACT'
                      ),
                      onClick: handleChangeContactClick,
                  },
              ]
            : undefined;

    const handleDataTracking = (isExpanded: boolean) => {
        const action = 'contact ' + (isExpanded ? 'expand' : 'collapse');
        AnalyticsSvc.track('RCX_agent_contactInfo_action', {
            type: CustomerType.KnownCustomer,
            section,
            action,
        });
    };

    return (
        <div data-aid={CONTACT_MANAGEMENT_CONTACT_DETAIL}>
            <FormProvider {...methods}>
                <ContactAccordion
                    title={name}
                    subTitle={subTitle}
                    menuActions={menuActions}
                    defaultExpanded={false}
                    expandedBottomBorder
                    handleDataTracking={handleDataTracking}
                >
                    <ProfileForm tags={tags} onSubmit={onSubmit} />
                </ContactAccordion>
            </FormProvider>
            <ConfirmModal
                open={isOpenModal}
                saveButtonText={t(
                    'CONTACT_MANAGEMENT.CONTACT_PROFILE.CONTINUE'
                )}
                title={t('CONTACT_MANAGEMENT.CONTACT_PROFILE.CHANGE_CONTACT')}
                confirmText={t(
                    'CONTACT_MANAGEMENT.CONTACT_PROFILE.CHANGE_CONTACT_CONFIRM_TEXT'
                )}
                onClickCancelButton={() => setIsOpenModal(false)}
                onClickSaveButton={onChangeContact}
                errorMessage={changeContactErrorMessage}
                isLoading={isLoading}
            />
        </div>
    );
};
