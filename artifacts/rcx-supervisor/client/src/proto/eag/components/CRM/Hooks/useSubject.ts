import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

export function useCallLogSubject(phoneNumber: string, isInbound: boolean) {
    const { t } = useTranslation();

    const subject = useMemo(() => {
        const langKey = `CRM.COMMON.CALL_LOG.${
            isInbound ? 'INBOUND_FROM' : 'OUTBOUND_TO'
        }`;
        return t(langKey, {
            phoneNumber: phoneNumber || t('CRM.COMMON.ANONYMOUS_CALLER'),
        });
    }, [phoneNumber, isInbound, t]);

    return subject;
}

export function useMessageLogSubject(channelType: string, uuid: string) {
    const { t } = useTranslation();

    const subject = useMemo(() => {
        return t('CRM.COMMON.CALL_LOG.INBOUND_DIGITAL', {
            channelName: t(
                `CRM.COMMON.CALL_LOG.CHANNELS.${
                    channelType ? channelType.toUpperCase() : 'DEFAULT'
                }`
            ),
            uuid,
        });
    }, [channelType, uuid, t]);

    return subject;
}
