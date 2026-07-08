import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import type { UseKVPairColumns } from './types';
import { KV } from './types';
import { renderTextInputControl } from '../../helpers/form/inputs/renderTextInputControl';
import { i18next } from '../../services/translate';

export const useKVPairColumns: UseKVPairColumns = (
    render = renderTextInputControl({}),
    i18n = i18next
) => {
    const { t } = useTranslation(undefined, { i18n });

    return useMemo(
        () => [
            {
                id: KV.KEY,
                content: t('VARIABLES_LIST.NAME'),
                render,
            },
            {
                id: KV.VALUE,
                content: t('VARIABLES_LIST.VALUE'),
                render,
            },
        ],
        [render, t]
    );
};
