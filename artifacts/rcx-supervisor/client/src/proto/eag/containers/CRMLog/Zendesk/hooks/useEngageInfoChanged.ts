import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import type { MatchItem } from '../../../../components/CRM/types';
import { RecordType } from '../constants';
import type { IZendeskLogFormData } from '../types';

export function useEngageInfoChanged(
    formData: IZendeskLogFormData,
    matchedUsers: MatchItem[],
    onEngageInfoChanged: (info: any) => void
) {
    const { t } = useTranslation();
    const selectedUser = formData.user;
    useEffect(() => {
        onEngageInfoChanged({
            callName: selectedUser?.id
                ? selectedUser.name
                : matchedUsers?.length > 1
                  ? `${t('CRM.COMMON.MULTIPLE_MATCHES')} (${
                        matchedUsers.length
                    })`
                  : t('SOFTPHONE.MANUAL_OUTDIAL.UNKNOWN'),
            callUrl: selectedUser?.url || null,
            callId: selectedUser?.id || null,
            callType: RecordType.User,
            hyperlink: !selectedUser?.id && matchedUsers.length > 1,
            linkType: 'name',
        });
    }, [matchedUsers, onEngageInfoChanged, selectedUser, t]);
}
