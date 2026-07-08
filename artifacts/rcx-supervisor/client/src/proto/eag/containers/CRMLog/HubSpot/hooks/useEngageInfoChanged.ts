import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import type { MatchItem } from '../../../../components/CRM/types';

export function useEngageInfoChanged(
    associations: MatchItem[] | undefined,
    matchedItems: MatchItem[],
    onEngageInfoChanged: (info: any) => void
) {
    const { t } = useTranslation();

    const getEngageName = (
        item: MatchItem | undefined,
        matchedItems: MatchItem[]
    ) => {
        if (item?.name) {
            return item.name;
        }

        return matchedItems.length > 1
            ? `${t('CRM.COMMON.MULTIPLE_MATCHES')} (${matchedItems?.length})`
            : t('SOFTPHONE.MANUAL_OUTDIAL.UNKNOWN');
    };

    const getEngageUrl = (item?: MatchItem) => (item?.url ? item.url : null);

    useEffect(() => {
        const item = associations?.[0];
        const callName = getEngageName(item, matchedItems);
        const callUrl = getEngageUrl(item);

        onEngageInfoChanged?.({
            callName,
            callUrl,
            hyperlink: associations?.length === 0 && matchedItems.length > 1,
            linkType: 'name',
        });
    }, [associations, matchedItems]);
}
