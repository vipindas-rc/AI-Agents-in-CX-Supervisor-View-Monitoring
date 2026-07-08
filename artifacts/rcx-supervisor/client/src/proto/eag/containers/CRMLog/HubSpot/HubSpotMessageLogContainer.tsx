import type { FC } from 'react';

import { useFormData } from './hooks/useFormData';
import { useHubSpotMatchRecords } from './hooks/useHubSpotMatchRecords';
import { HubSpotLogForm } from './HubSpotLogForm';
import type {
    HubSpotMessageLogContainerProps,
    IHubSpotLogFormData,
} from './types';
import { useMessageLogSubject } from '../../../components/CRM/Hooks/useSubject';
import { ParamsType } from '../../../constants/crm';

export const HubSpotMessageLogContainer: FC<
    HubSpotMessageLogContainerProps
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
        useHubSpotMatchRecords(ParamsType.DIGITAL, chat);

    const handleFormDataChanged = (formData: IHubSpotLogFormData) => {
        setFormData(formData);
        onFormDataChanged?.(formData);
    };

    return (
        <HubSpotLogForm
            typeGroups={typeGroups}
            disabled={disabled}
            formData={formData}
            isLoading={!isMatched}
            matchedAssociations={matchedItems}
            engageType={ParamsType.DIGITAL}
            engageInfo={chat}
            onFormDataChanged={handleFormDataChanged}
            onEngageInfoChanged={onEngageInfoChanged}
            reloadMatchedList={reloadMatchedList}
        />
    );
};
