import type { FC } from 'react';

import { FreshdeskLogForm } from './FreshdeskLogForm';
import { useFormData } from './hooks/useFormData';
import { useFreshdeskMatchRecords } from './hooks/useFreshdeskMatchRecords';
import { useFreshdeskPopRecords } from './hooks/useFreshdeskPopRecords';
import type {
    FreshdeskLogContainerProps,
    IFreshdeskLogFormData,
} from './types';
import { useCallLogSubject } from '../../../components/CRM/Hooks/useSubject';
import type { MatchItem } from '../../../components/CRM/types';
import { CRMCallTypes, ParamsType } from '../../../constants/crm';

export const FreshdeskCallLogContainer: FC<FreshdeskLogContainerProps> = ({
    disabled = false,
    engageInfo,
    onEngageInfoChanged,
    shouldCreateRecordWhenNoMatch = false,
    shouldPopRecordWhenMatched = true,
    shouldPopRecordMoreThanOnce = false,
    resetHyperlinkType = () => {},
    hyperlinkType,
    selectSize,
    onFormDataChanged,
    initialFormData,
}) => {
    const { ani, aniE164, callType } = engageInfo;
    const phoneNumber = aniE164 || ani;
    const isInbound = callType === CRMCallTypes.Inbound;
    const defaultSubject = useCallLogSubject(phoneNumber, isInbound);
    const { formData, setFormData } = useFormData(
        defaultSubject,
        initialFormData
    );

    const { isMatched, matchedUsers } = useFreshdeskMatchRecords(
        ParamsType.Call,
        engageInfo,
        disabled
    );

    const handleFormDataChanged = (formData: IFreshdeskLogFormData) => {
        if (disabled) {
            return;
        }
        setFormData(formData);
        onFormDataChanged?.(formData);
    };
    const afterCreateUser = (user: MatchItem) => {
        handleFormDataChanged({ ...formData, user });
    };

    useFreshdeskPopRecords({
        disabled,
        isMatched,
        engageInfo,
        matchedUsers,
        afterCreateUser,
        shouldPopRecordWhenMatched,
        shouldCreateRecordWhenNoMatch,
        shouldPopRecordMoreThanOnce,
    });

    return (
        <FreshdeskLogForm
            disabled={disabled}
            matchedUsers={matchedUsers}
            hyperlinkType={hyperlinkType}
            selectSize={selectSize}
            resetHyperlinkType={resetHyperlinkType}
            onEngageInfoChanged={onEngageInfoChanged}
            formData={formData}
            onFormDataChanged={handleFormDataChanged}
            isLoading={!isMatched}
            engageInfo={engageInfo}
            engageType={ParamsType.Call}
        />
    );
};
