import type { FC } from 'react';

import { useFormData } from './hooks/useFormData';
import { useNetSuiteMatchRecords } from './hooks/useNetSuiteMatchRecords';
import { NetSuiteLogForm } from './NetSuiteLogForm';
import type { NetSuiteMessageLogContainerProps, FormData } from './types';
import { useMessageLogSubject } from '../../../components/CRM/Hooks/useSubject';
import { ParamsType } from '../../../constants/crm';

export const NetSuiteMessageLogContainer: FC<
    NetSuiteMessageLogContainerProps
> = ({
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

    const { isMatched, matchedItems, typeGroups, reloadMatchedList } =
        useNetSuiteMatchRecords(ParamsType.DIGITAL, chat);

    const handleFormDataChanged = (formData: FormData) => {
        setFormData(formData);
        onFormDataChanged?.(formData);
    };

    return (
        <NetSuiteLogForm
            isLoading={!isMatched}
            fields={typeGroups?.types || []}
            disabled={disabled}
            formData={formData}
            matchedCompanies={matchedItems}
            engageType={ParamsType.DIGITAL}
            engageInfo={chat}
            onFormDataChanged={handleFormDataChanged}
            onEngageInfoChanged={onEngageInfoChanged}
            reloadMatchedList={reloadMatchedList}
        />
    );
};
