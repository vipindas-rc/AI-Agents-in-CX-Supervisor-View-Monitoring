import type { FC } from 'react';

import { FreshdeskLogForm } from './FreshdeskLogForm';
import { useFormData } from './hooks/useFormData';
import { useFreshdeskMatchRecords } from './hooks/useFreshdeskMatchRecords';
import type {
    FreshdeskLogContainerProps,
    IFreshdeskLogFormData,
} from './types';
import { useMessageLogSubject } from '../../../components/CRM/Hooks/useSubject';
import { ParamsType } from '../../../constants/crm';

export const FreshdeskMessageLogContainer: FC<FreshdeskLogContainerProps> = ({
    disabled,
    engageInfo: chat,
    initialFormData,
    onFormDataChanged,
    onEngageInfoChanged,
}) => {
    const defaultSubject = useMessageLogSubject(chat.channelType, chat.edUuid);
    const { formData, setFormData } = useFormData(
        defaultSubject,
        initialFormData
    );
    const { isMatched, matchedUsers } = useFreshdeskMatchRecords(
        ParamsType.DIGITAL,
        chat,
        disabled
    );

    const handleFormDataChanged = (formData: IFreshdeskLogFormData) => {
        if (disabled) {
            return;
        }
        setFormData(formData);
        onFormDataChanged?.(formData);
    };

    return (
        <FreshdeskLogForm
            disabled={disabled}
            formData={formData}
            matchedUsers={matchedUsers}
            engageType={ParamsType.DIGITAL}
            engageInfo={chat}
            onFormDataChanged={handleFormDataChanged}
            onEngageInfoChanged={onEngageInfoChanged}
            isLoading={!isMatched}
        />
    );
};
