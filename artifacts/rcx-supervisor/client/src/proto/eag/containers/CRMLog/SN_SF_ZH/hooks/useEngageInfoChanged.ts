import { useEffect } from 'react';

import { useTranslation } from 'react-i18next';

import type { MatchItem } from '../../../../components/CRM/types';
import type { FormData } from '../types';

export function useEngageInfoChanged(
    currentCall: any,
    formData: FormData,
    nameItems: MatchItem[],
    relatedToItems: MatchItem[],
    onEngageInfoChanged: (info: any) => void
) {
    const { t } = useTranslation();

    useEffect(() => {
        let callInfo = {
            callName: '',
            hyperlink: false,
            linkType: '',
            callUrl: '',
            callId: '',
            callType: '',
        };
        const caseNumber = currentCall.baggage?.caseNumber;
        if (caseNumber && formData.relatedTo?.name === caseNumber) {
            callInfo.callName = formData.relatedTo!.name!;
        } else if (formData.name?.id) {
            callInfo.callName = formData.name.name;
            callInfo.callUrl = formData.name.url!;
            callInfo.callId = formData.name.id;
            callInfo.callType = formData.name.type!;
        } else if (formData.relatedTo?.id) {
            callInfo.callName = formData.relatedTo.name;
            callInfo.callUrl = formData.relatedTo.url || '';
            callInfo.callId = formData.relatedTo.id;
            callInfo.callType = formData.relatedTo.type || '';
        } else if (nameItems.length > 1 || relatedToItems.length > 1) {
            callInfo = {
                callName: `${t('CRM.COMMON.MULTIPLE_MATCHES')} (${
                    nameItems.length > 1
                        ? nameItems.length
                        : relatedToItems.length
                })`,
                callUrl: '',
                callId: '',
                callType: '',
                hyperlink: true,
                linkType: nameItems.length > 1 ? 'name' : 'relatedTo',
            };
        } else {
            callInfo.callName = t('SOFTPHONE.MANUAL_OUTDIAL.UNKNOWN');
        }
        onEngageInfoChanged(callInfo);
    }, [
        nameItems.length,
        relatedToItems.length,
        formData,
        currentCall,
        t,
        onEngageInfoChanged,
    ]);
}
