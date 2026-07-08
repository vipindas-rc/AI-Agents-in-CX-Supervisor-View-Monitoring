import { useTranslation } from 'react-i18next';

import type { CreateField } from '../../../../components/CRM/types';

interface UseCreateFieldTransformProps {
    createFields: CreateField[];
    isChat: boolean;
    isFreshservice: boolean;
    getUserFieldValues: {
        phone: string;
        email: string;
        phoneErrorType: string;
        emailErrorType: string;
    };
}

export const useCreateFieldTransform = ({
    createFields,
    isChat,
    isFreshservice,
    getUserFieldValues,
}: UseCreateFieldTransformProps) => {
    const { t } = useTranslation();

    const transformFields = () => {
        return createFields.map((field) => {
            const isUserField =
                field.labelTranslateKey === 'CRM.FRESHSERVICE.USER';

            const shouldDisable =
                isUserField &&
                isChat &&
                isFreshservice &&
                (((!getUserFieldValues.phone ||
                    getUserFieldValues.phone.trim() === '') &&
                    (!getUserFieldValues.email ||
                        getUserFieldValues.email.trim() === '')) ||
                    getUserFieldValues.phoneErrorType === 'INVALID' ||
                    getUserFieldValues.emailErrorType === 'INVALID');
            const tooltipProps = shouldDisable
                ? {
                      tooltipText: t('CRM.COMMON.ERROR_MESSAGE.10019'),
                  }
                : {};

            return {
                ...field,
                ...tooltipProps,
                disabled: shouldDisable,
                label: t(field.labelTranslateKey || ''), // Add the required label property
            };
        });
    };

    return {
        transformedFields: transformFields(),
    };
};
