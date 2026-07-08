import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import type { MatchItem } from '../../../../components/CRM/types';
import type { FormData } from '../types';

export function useEngageInfoChanged(
    formdata: FormData,
    matchedCompanies: MatchItem[],
    onEngageInfoChanged: (info: any) => void
) {
    const { t } = useTranslation();

    const getEngageName = (
        item: MatchItem | null | undefined,
        matchedCompanies: MatchItem[]
    ) => {
        if (item?.name) {
            return item.name;
        }

        return matchedCompanies.length > 1
            ? `${t(
                  'CRM.COMMON.MULTIPLE_MATCHES'
              )} (${matchedCompanies?.length})`
            : t('SOFTPHONE.MANUAL_OUTDIAL.UNKNOWN');
    };

    useEffect(() => {
        const callName = getEngageName(formdata?.company, matchedCompanies);

        onEngageInfoChanged?.({
            callName,
            callUrl: formdata?.company?.url || null,
            hyperlink: !formdata?.company?.id && matchedCompanies.length > 1,
            linkType: 'name',
        });
    }, [formdata?.company, matchedCompanies]);
}
