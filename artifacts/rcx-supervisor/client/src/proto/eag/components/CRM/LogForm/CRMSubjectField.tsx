import type { ChangeEvent, FC } from 'react';

import { useTranslation } from 'react-i18next';

import { CRMFormField, type CRMFormFieldProps } from './CRMFormField';
import { useLogFormContext } from './CRMLogFormContext';
import { CRM_INPUT_SUBJECT } from '../../../constants/testIds';
import { CRMMatchResultInput } from '../CRMMatchResult/CRMMatchResult.styled';

export interface CRMSubjectFieldProps extends Partial<CRMFormFieldProps> {
    value: string;
    onChange?: (value: string) => void;
}

export const CRMSubjectField: FC<CRMSubjectFieldProps> = ({
    value,
    labelAid,
    onChange,
}) => {
    const { disabled, onFormDataChanged } = useLogFormContext();
    const { t } = useTranslation();

    const handleChangeSubject = (e: ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        onChange?.(newValue);
        onFormDataChanged?.({ subject: newValue });
    };

    return (
        <CRMFormField label={t('CRM.COMMON.SUBJECT')} labelAid={labelAid}>
            <CRMMatchResultInput
                disabled={disabled}
                value={value}
                onChange={handleChangeSubject}
                maxLength={255}
                data-aid={CRM_INPUT_SUBJECT}
                aria-label={t('CRM.COMMON.SUBJECT')}
            />
        </CRMFormField>
    );
};
