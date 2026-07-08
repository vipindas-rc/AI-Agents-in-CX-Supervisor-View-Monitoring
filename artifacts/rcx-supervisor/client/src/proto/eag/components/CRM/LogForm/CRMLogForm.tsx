import { useMemo, type PropsWithChildren } from 'react';

import { Spinner } from '@ringcx/ui';

import { CRMLogFormContext } from './CRMLogFormContext';
import { CRM_LOG_FORM_LOADING } from '../../../constants/testIds';
import { CRMMatchResultWrapper } from '../CRMMatchResult/CRMMatchResult.styled';
import { CRMLoading } from '../CRMMatchResult/styled';
import type { CRMFormState } from '../types';

type CRMLogFormProps = PropsWithChildren<CRMFormState>;

export const CRMLogForm = ({
    isLoading,
    disabled,
    formData,
    onFormDataChanged,
    children,
}: CRMLogFormProps) => {
    const childContext: CRMFormState = useMemo(() => {
        return {
            disabled,
            formData,
            onFormDataChanged,
        };
    }, [disabled, onFormDataChanged, formData]);

    return (
        <CRMLogFormContext.Provider value={childContext}>
            {isLoading && (
                <CRMLoading data-aid={CRM_LOG_FORM_LOADING}>
                    <Spinner />
                </CRMLoading>
            )}
            <CRMMatchResultWrapper>{children}</CRMMatchResultWrapper>
        </CRMLogFormContext.Provider>
    );
};
