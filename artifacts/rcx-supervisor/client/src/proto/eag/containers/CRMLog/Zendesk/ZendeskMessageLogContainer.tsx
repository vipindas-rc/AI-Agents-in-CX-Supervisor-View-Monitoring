import type { FC } from 'react';

import { useFormData } from './hooks/useFormData';
import { useZendeskMatchRecords } from './hooks/useZendeskMatchRecords';
import type { ZendeskLogContainerProps, IZendeskLogFormData } from './types';
import { ZendeskLogForm } from './ZendeskLogForm';
import { useMessageLogSubject } from '../../../components/CRM/Hooks/useSubject';
import { ParamsType } from '../../../constants/crm';

export const ZendeskMessageLogContainer: FC<ZendeskLogContainerProps> = ({
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
    const { isMatched, matchedUsers } = useZendeskMatchRecords(
        ParamsType.DIGITAL,
        chat,
        disabled
    );

    const handleFormDataChanged = (formData: IZendeskLogFormData) => {
        if (disabled) {
            return;
        }
        setFormData(formData);
        onFormDataChanged?.(formData);
    };

    return (
        <ZendeskLogForm
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
