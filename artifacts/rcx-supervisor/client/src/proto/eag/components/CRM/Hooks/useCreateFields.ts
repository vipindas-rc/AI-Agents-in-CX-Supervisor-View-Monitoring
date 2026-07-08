import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import { useCreateRecord } from './useCreateRecord';
import type { CreateField } from '../types';

export function useCreateFields(fields: CreateField[] = [], data: any) {
    const { t } = useTranslation();
    const createFields = useMemo(() => {
        return fields.map(
            ({
                type,
                label,
                labelTranslateKey,
                tooltipText,
                excludeFromCreateMenu,
            }) => ({
                type,
                label: label || t(labelTranslateKey || ''),
                tooltipText,
                labelTranslateKey,
                excludeFromCreateMenu,
            })
        );
    }, [fields, t]);

    const handleCreateRecord = useCreateRecord(data);
    return { createFields, handleCreateRecord };
}
