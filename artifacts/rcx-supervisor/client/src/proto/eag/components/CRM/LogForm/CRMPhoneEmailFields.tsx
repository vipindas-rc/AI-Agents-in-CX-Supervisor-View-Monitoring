import { Fragment, type ChangeEvent, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { CRMFormField } from './CRMFormField';
import { CRM_INPUT_PHONE, CRM_INPUT_EMAIL } from '../../../constants/testIds';
import {
    CRMMatchResultInput,
    ErrorMessage,
} from '../CRMMatchResult/CRMMatchResult.styled';

interface CRMPhoneEmailFieldsProps {
    phone: string;
    email: string;
    isPhoneDisabled?: boolean;
    isEmailDisabled?: boolean;
    hasPhoneError: boolean;
    hasEmailError: boolean;
    phoneErrorType: string;
    emailErrorType: string;
    onFormDataChanged: (data: any) => void;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\+?[\d-]{10,}$/;

export const CRMPhoneEmailFields: FC<CRMPhoneEmailFieldsProps> = ({
    phone = '',
    email = '',
    isPhoneDisabled,
    isEmailDisabled,
    hasPhoneError,
    hasEmailError,
    phoneErrorType,
    emailErrorType,
    onFormDataChanged,
}) => {
    const { t } = useTranslation();

    const validatePhoneEmail = (newPhone: string, newEmail: string) => {
        const phoneIsEmpty = !newPhone;
        const emailIsEmpty = !newEmail;
        const phoneIsValid = PHONE_REGEX.test(newPhone);
        const emailIsValid = EMAIL_REGEX.test(newEmail);

        if (phoneIsEmpty && emailIsEmpty) {
            return {
                hasPhoneError: true,
                hasEmailError: true,
                phoneErrorType: 'REQUIRED',
                emailErrorType: 'REQUIRED',
            };
        }

        return {
            hasPhoneError: !phoneIsEmpty && !phoneIsValid,
            hasEmailError: !emailIsEmpty && !emailIsValid,
            phoneErrorType: !phoneIsEmpty && !phoneIsValid ? 'INVALID' : '',
            emailErrorType: !emailIsEmpty && !emailIsValid ? 'INVALID' : '',
        };
    };

    const handleChangePhone = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const validation = validatePhoneEmail(newValue, email);

        onFormDataChanged({
            phone: newValue,
            isPhoneManualEdited: true,
            ...validation,
        });
    };

    const handleChangeEmail = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        const validation = validatePhoneEmail(phone, newValue);

        onFormDataChanged({
            email: newValue,
            isEmailManualEdited: true,
            ...validation,
        });
    };

    const getErrorMessage = (type: string, field: 'phone' | 'email') => {
        if (type === 'INVALID') {
            return field === 'phone'
                ? t('CRM.COMMON.ERROR_MESSAGE.10020')
                : t('CRM.COMMON.ERROR_MESSAGE.10021');
        }
        if (type === 'REQUIRED' && phone === '' && email === '') {
            return t('CRM.COMMON.ERROR_MESSAGE.10016');
        }
        return '';
    };

    return (
        <Fragment>
            <CRMFormField
                label={t('CONTACT_MANAGEMENT.CONTACT_PROFILE.PHONE_NUMBER')}
            >
                <CRMMatchResultInput
                    disabled={isPhoneDisabled}
                    value={phone}
                    onChange={handleChangePhone}
                    data-aid={CRM_INPUT_PHONE}
                />
                {hasPhoneError && !isPhoneDisabled && (
                    <ErrorMessage>
                        {getErrorMessage(phoneErrorType, 'phone')}
                    </ErrorMessage>
                )}
            </CRMFormField>
            <CRMFormField label={t('CONTACT_MANAGEMENT.CONTACT_PROFILE.EMAIL')}>
                <CRMMatchResultInput
                    disabled={isEmailDisabled}
                    value={email}
                    onChange={handleChangeEmail}
                    data-aid={CRM_INPUT_EMAIL}
                />
                {hasEmailError && !isEmailDisabled && (
                    <ErrorMessage>
                        {getErrorMessage(emailErrorType, 'email')}
                    </ErrorMessage>
                )}
            </CRMFormField>
        </Fragment>
    );
};
