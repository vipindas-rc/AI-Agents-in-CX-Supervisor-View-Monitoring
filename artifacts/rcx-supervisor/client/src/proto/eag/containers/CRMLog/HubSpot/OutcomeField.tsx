import { useMemo, type FC } from 'react';

import { useTranslation } from 'react-i18next';

import { DataTrackingEventNames } from './constants';
import type { IHubSpotLogFormData } from './types';
import { StyledSingleSelect } from '../../../components/CRM/CRMMatchResult/styled';
import { useAngularModule } from '../../../components/CRM/Hooks/useAngularModule';
import {
    CRMFormField,
    useLogFormContext,
    type CRMFormFieldProps,
} from '../../../components/CRM/LogForm';
import type { MatchItem } from '../../../components/CRM/types';
import { CRM_SELECT_OUTCOME } from '../../../constants/testIds';

export interface OutcomeFieldProps extends Partial<CRMFormFieldProps> {
    outcomeList: MatchItem[];
}

export const OutcomeField: FC<OutcomeFieldProps> = ({ outcomeList }) => {
    const { disabled, onFormDataChanged, formData } =
        useLogFormContext<IHubSpotLogFormData>();
    const { t } = useTranslation();
    const AnalyticsSvc = useAngularModule('AnalyticsSvc');

    const outcomeData = useMemo(() => {
        return {
            items: outcomeList.map((item: MatchItem) => ({
                id: item.id || '',
                displayName: item.name,
            })),
        };
    }, [outcomeList]);

    const handleSelectOutcome = (selectedId: string) => {
        onFormDataChanged?.({ outcomeId: selectedId });
    };

    return (
        <CRMFormField label={t('CRM.HUBSPOT.OUTCOME')}>
            <StyledSingleSelect
                disabled={disabled}
                data={outcomeData}
                onChange={handleSelectOutcome}
                onOpen={() => {
                    AnalyticsSvc.track(
                        DataTrackingEventNames.RCXVoiceMatchOutcome
                    );
                }}
                error={false}
                title=''
                message=''
                selectedItemId={formData.outcomeId}
                enableClearButton={!disabled}
                visibleItemsCount={4}
                size='small'
                placeholder={t('CRM.HUBSPOT.OUTCOME_SELECT_PLACEHOLDER')}
                nothingAvailableText={t('CRM.HUBSPOT.OUTCOME_NO_RESULT')}
                data-aid={CRM_SELECT_OUTCOME}
            />
        </CRMFormField>
    );
};
