import { useEffect, useState } from 'react';

import { SearchMd } from '@ringcentral/spring-icon';
import {
    Button,
    Icon,
    MenuItemText,
    Option,
    Select,
    TextField,
} from '@ringcentral/spring-ui';
import { parsePhoneNumber } from '@ringcx/shared';
import {
    Controller,
    type FieldValues,
    useFormContext,
    useWatch,
} from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import {
    identifierOptions,
    SEARCH_TRANSLATION_KEYS,
    PHONE,
    EMAIL,
    SEARCH_BY_CELL_PHONE,
    SEARCH_BY_EMAIL,
} from './constants';
import {
    getContactProfile,
    updateActivity,
    updateContactProfile,
} from '../../../common/services/transport';
import {
    CONTACT_MANAGEMENT_UNKNOWN_CONTACT,
    IDENTIFIER_TYPE_SELECT,
} from '../../../constants/testIds';
import injector from '../../../helpers/injector';
import { ContactAccordion } from '../components/ContactAccordion';
import { type PageType, CustomerType } from '../types';

type UnknownContactProps = {
    phoneNumber?: string;
    activityId?: string;
    rcAccountId: string;
    rcxSubAccountId: string;
    updateIsShowCreateNewContact: (value: boolean) => void;
    reloadContactProfile: () => void;
    section: PageType;
    isActivityIdUseless: boolean;
};

export const UnknownContact = ({
    phoneNumber,
    activityId,
    rcAccountId,
    rcxSubAccountId,
    updateIsShowCreateNewContact,
    reloadContactProfile,
    section,
    isActivityIdUseless,
}: UnknownContactProps) => {
    const AnalyticsSvc = injector('AnalyticsSvc');
    const { t } = useTranslation();

    const { control, handleSubmit } = useFormContext();
    const [isShowNoFoundMessage, setIsShowNoFoundMessage] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const selectedKind = useWatch({
        control,
        name: 'kind',
        defaultValue: PHONE,
    });

    const getSearchAriaLabel = () => {
        if (selectedKind === PHONE) {
            return t(SEARCH_TRANSLATION_KEYS.SEARCH_BY_CELL_PHONE);
        } else if (selectedKind === EMAIL) {
            return t(SEARCH_TRANSLATION_KEYS.SEARCH_BY_EMAIL);
        }
        return t(SEARCH_TRANSLATION_KEYS.SEARCH);
    };

    useEffect(() => {
        AnalyticsSvc.track('View RCX_agent_contactInfo page', {
            type: CustomerType.UnknownCustomer,
            section,
        });
    }, [section]);

    const onSubmit = async (data: FieldValues) => {
        setIsShowNoFoundMessage(false);
        setIsLoading(true);
        let { value } = data;
        const { kind } = data;
        const action = kind === PHONE ? SEARCH_BY_CELL_PHONE : SEARCH_BY_EMAIL;
        AnalyticsSvc.track('RCX_agent_contactInfo_action', {
            type: CustomerType.UnknownCustomer,
            section,
            action,
        });
        if (!value) {
            setIsShowNoFoundMessage(true);
            AnalyticsSvc.track('RCX_agent_contactInfo_searchResult', {
                section,
                result: 'no match result',
            });
            setIsLoading(false);
            return;
        }
        try {
            if (kind === 'Phone') {
                const { isValid, e164 } = parsePhoneNumber(value);
                value = isValid ? e164 : value;
            } else {
                value = value.toLowerCase();
            }
            const params = {
                kind,
                value,
            };
            const { id, attributes } = await getContactProfile({
                accountId: rcAccountId,
                rcxSubAccountId,
                params,
            });
            const mobilePhones = attributes.filter(
                (attribute) =>
                    attribute.kind === 'Phone' &&
                    attribute.label === 'MobilePhones'
            );
            if (!isActivityIdUseless && activityId) {
                await updateActivity({
                    accountId: rcAccountId,
                    rcxSubAccountId,
                    activityId,
                    params: {
                        contactId: id,
                    },
                });
            } else {
                await updateContactProfile({
                    accountId: rcAccountId,
                    rcxSubAccountId,
                    contactId: id,
                    params: {
                        attributes: [
                            ...mobilePhones,
                            {
                                kind: 'Phone',
                                label: 'MobilePhones',
                                value: phoneNumber,
                                isIdentifier: true,
                            },
                        ],
                    },
                });
            }
            AnalyticsSvc.track('RCX_agent_contactInfo_searchResult', {
                section,
                result: 'with result',
            });
            reloadContactProfile();
        } catch (e) {
            setIsShowNoFoundMessage(true);
            AnalyticsSvc.track('RCX_agent_contactInfo_searchResult', {
                section,
                result: 'no match result',
            });
        }
        setIsLoading(false);
    };

    const createNewContact = () => {
        updateIsShowCreateNewContact(true);
        AnalyticsSvc.track('RCX_agent_contactInfo_action', {
            type: CustomerType.UnknownCustomer,
            section,
            action: 'create new contact',
        });
    };

    const handleDataTracking = (isExpanded: boolean) => {
        const action = 'contact ' + (isExpanded ? 'expand' : 'collapse');
        AnalyticsSvc.track('RCX_agent_contactInfo_action', {
            type: CustomerType.UnknownCustomer,
            section,
            action,
        });
    };

    return (
        <div data-aid={CONTACT_MANAGEMENT_UNKNOWN_CONTACT}>
            <ContactAccordion
                title={t('CONTACT_MANAGEMENT.CONTACT_PROFILE.ADD_CONTACT')}
                defaultExpanded
                handleDataTracking={handleDataTracking}
            >
                <div className='grid gap-4 p-4'>
                    <Controller
                        name='kind'
                        control={control}
                        render={({ field }) => (
                            <Select
                                {...field}
                                label={t(
                                    'CONTACT_MANAGEMENT.CONTACT_PROFILE.IDENTIFIER_TYPE'
                                )}
                                variant='outlined'
                                size='medium'
                                renderValue={(value) =>
                                    identifierOptions.find(
                                        (option) => option.key === value
                                    )?.label
                                }
                                data-aid={IDENTIFIER_TYPE_SELECT}
                            >
                                {identifierOptions.map(({ key, label }) => {
                                    return (
                                        <Option key={key} value={key}>
                                            <MenuItemText>{label}</MenuItemText>
                                        </Option>
                                    );
                                })}
                            </Select>
                        )}
                    />
                    <Controller
                        name='value'
                        control={control}
                        render={({ field }) => (
                            <TextField
                                {...field}
                                placeholder={t(
                                    'CONTACT_MANAGEMENT.CONTACT_PROFILE.SEARCH'
                                )}
                                inputProps={{
                                    'aria-label': getSearchAriaLabel(),
                                }}
                                startAdornment={<Icon symbol={SearchMd} />}
                                size='medium'
                                fullWidth
                            />
                        )}
                    />
                    <div className='flex justify-end space-x-4'>
                        <Button
                            color='secondary'
                            variant='outlined'
                            size='large'
                            disabled={isLoading}
                            onClick={() => createNewContact()}
                        >
                            {t('CONTACT_MANAGEMENT.CONTACT_PROFILE.CREATE_NEW')}
                        </Button>
                        <Button
                            size='large'
                            loading={isLoading}
                            onClick={handleSubmit(onSubmit)}
                        >
                            {t('CONTACT_MANAGEMENT.CONTACT_PROFILE.SEARCH')}
                        </Button>
                    </div>
                </div>
                <div
                    className='typography-title flex justify-center py-12'
                    role='status'
                >
                    {isShowNoFoundMessage &&
                        t(
                            'CONTACT_MANAGEMENT.CONTACT_PROFILE.NO_MATCHES_FOUND'
                        )}
                </div>
            </ContactAccordion>
        </div>
    );
};
