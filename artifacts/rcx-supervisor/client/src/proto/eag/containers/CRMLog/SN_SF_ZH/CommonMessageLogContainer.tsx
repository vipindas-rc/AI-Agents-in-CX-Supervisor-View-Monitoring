import type { FC } from 'react';

import { CommonLogForm } from './CommonLogForm';
import { useFormData } from './hooks/useFormData';
import type { CommonMessageLogContainerProps, FormData } from './types';
import { useMessageLogSubject } from '../../../components/CRM/Hooks/useSubject';

export const CommonMessageLogContainer: FC<CommonMessageLogContainerProps> = ({
    disabled,
    engageInfo: chat,
    initialFormData,
    matchedNameItems,
    matchedRelatedToItems,
    isMatched,
    onFormDataChanged,
    onEngageInfoChanged,
    engageType,
    platform,
    reloadMatchedList,
    customNameFields,
    customRelatedToFields,
}) => {
    const defaultSubject = useMessageLogSubject(chat.channelType, chat.edUuid);
    const { formData, setFormData } = useFormData(
        defaultSubject,
        initialFormData
    );

    const handleFormDataChanged = (formData: FormData) => {
        if (disabled) {
            return;
        }
        setFormData(formData);
        onFormDataChanged?.(formData);
    };

    return (
        <CommonLogForm
            disabled={disabled}
            formData={formData}
            nameItems={matchedNameItems}
            relatedToItems={matchedRelatedToItems}
            engageType={engageType}
            engageInfo={chat}
            onFormDataChanged={handleFormDataChanged}
            onEngageInfoChanged={onEngageInfoChanged}
            platform={platform}
            isLoading={!isMatched}
            customNameFields={customNameFields}
            customRelatedToFields={customRelatedToFields}
            reloadMatchedList={reloadMatchedList}
        />
    );
};
