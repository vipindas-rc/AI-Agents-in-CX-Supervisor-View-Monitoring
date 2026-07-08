import { useCallback } from 'react';

import { isAxiosError } from 'axios';
import _ from 'lodash';
import type { UseFormSetError } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import injector from '../../../helpers/injector';
import {
    DUPLICATED_IDENTIFIER_ERROR_CODE,
    INVALID_IDENTIFIER_ERROR_CODE,
} from '../ContactProfile/constants';
import type { ProfileFormType } from '../ContactProfile/types';
import type { CustomerType, PageType } from '../types';

export const useHandleDuplicatedIdentifierError = ({
    section,
    type,
}: {
    section: PageType;
    type: CustomerType;
}) => {
    const AnalyticsSvc = injector('AnalyticsSvc');
    const { t } = useTranslation();
    const growl = injector('growl');
    const SessionSvc = injector('SessionSvc');

    const handleDuplicatedIdentifierError = useCallback(
        ({
            e,
            data,
            setError,
        }: {
            e: unknown;
            data: ProfileFormType;
            setError: UseFormSetError<ProfileFormType>;
        }) => {
            if (!isAxiosError(e)) {
                return;
            }
            const {
                errorCode,
                raw_error: rawError = {},
                already_existing_identifiers: alreadyExistingIdentifiers = {},
                message = t('GENERICS.MESSAGES.ERROR'),
            } = e.response?.data.errors?.[0] ?? {};

            if (errorCode === INVALID_IDENTIFIER_ERROR_CODE) {
                growl.error(t('CONTACT_MANAGEMENT.INVALID_PHONE_ERROR'));
                return;
            }

            if (errorCode === DUPLICATED_IDENTIFIER_ERROR_CODE) {
                AnalyticsSvc.track('RCX_agent_contactInfo_error', {
                    type,
                    section,
                    result: 'identifier been used',
                });

                const {
                    emails: emailsError,
                    mobile_phones: mobilePhonesError,
                } = alreadyExistingIdentifiers;

                data.Email.items.forEach((email, index) => {
                    if (
                        emailsError?.includes(email.value.trim().toLowerCase())
                    ) {
                        setError(`Email.items[${index}]`, {
                            type: 'manual',
                            message: t(
                                'CONTACT_MANAGEMENT.CONTACT_PROFILE.DUPLICATED_EMAIL'
                            ),
                        });
                    }
                });

                if (SessionSvc.isI18nEnabled()) {
                    data.MobilePhones.items.forEach((mobilePhone, index) => {
                        if (mobilePhonesError?.includes(mobilePhone.value)) {
                            setError(`MobilePhones.items[${index}]`, {
                                type: 'manual',
                                message: t(
                                    'CONTACT_MANAGEMENT.CONTACT_PROFILE.DUPLICATED_CELL_PHONE'
                                ),
                            });
                        }
                    });
                } else if (mobilePhonesError?.length) {
                    growl.error(
                        `${mobilePhonesError.join(', ')} ${t(
                            'CONTACT_MANAGEMENT.CONTACT_PROFILE.DUPLICATED'
                        )}`
                    );
                }
                return;
            }

            growl.error(_.isEmpty(rawError) ? message : rawError);
        },
        [AnalyticsSvc, growl, section, t, type, SessionSvc]
    );

    return { handleDuplicatedIdentifierError };
};
