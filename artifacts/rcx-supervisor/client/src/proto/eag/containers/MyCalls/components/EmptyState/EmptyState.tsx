import { useCallback, useMemo, type FC } from 'react';

import { RcIcon, RcTypography } from '@ringcentral/juno';
import { PhoneBorder, Refresh } from '@ringcentral/juno-icon';
import { useTranslation } from 'react-i18next';

import type { EmptyStateProps } from './types';
import { BigActionButton } from '../../../../components/BigActionButton/BigActionButton';
import { EmptyStateImage } from '../../../../components/Splash/components/EmptyStateImage';
import { Splash } from '../../../../components/Splash/Splash';
import { MAKE_CALL_EVENT } from '../../../../constants/analyticsEvents';
import { SPLASH_TYPES } from '../../../../constants/emptyStates';
import injector from '../../../../helpers/injector';
import { withBrandTheme } from '../../../../helpers/withBrandTheme';

export const EmptyState: FC<EmptyStateProps> = withBrandTheme(
    ({
        onCall,
        isEmptyVoiceQueuesOrDgSelected = false,
        iconType = 'NoActiveCalls',
    }) => {
        const { t } = useTranslation();
        const isOutboundCallEnabled = !!onCall;
        const AnalyticsSvc = injector('AnalyticsSvc');

        const $state = injector('$state');

        const onNewCall = useCallback(() => {
            onCall && onCall();
            AnalyticsSvc.track(MAKE_CALL_EVENT);
        }, [AnalyticsSvc, onCall]);

        const handleUpdateSession = useCallback(() => {
            $state && $state.go('base.default.updatelogin');
        }, [$state]);

        const newButton = useMemo(
            () => (
                <BigActionButton
                    title={t('PHONE.JUPITER.EMPTY_PAGE.CALL_BUTTON')}
                    onClick={onNewCall}
                >
                    <RcIcon symbol={PhoneBorder} size='xsmall' />
                    <RcTypography>
                        {t('PHONE.JUPITER.EMPTY_PAGE.CALL_BUTTON')}
                    </RcTypography>
                </BigActionButton>
            ),
            [onNewCall, t]
        );

        const updateSessionButton = useMemo(
            () => (
                <BigActionButton
                    title={t('CHAT.NO_CHATS.ALERT_UPDATE')}
                    onClick={handleUpdateSession}
                >
                    <RcIcon symbol={Refresh} size='xsmall' />
                    <RcTypography>
                        {t('CHAT.NO_CHATS.ALERT_UPDATE')}
                    </RcTypography>
                </BigActionButton>
            ),
            [handleUpdateSession, t]
        );

        const getButton = useCallback(() => {
            if (isEmptyVoiceQueuesOrDgSelected) {
                return updateSessionButton;
            } else if (isOutboundCallEnabled) {
                return newButton;
            } else {
                return null;
            }
        }, [
            isEmptyVoiceQueuesOrDgSelected,
            isOutboundCallEnabled,
            newButton,
            updateSessionButton,
        ]);

        const getText = useCallback(() => {
            if (isEmptyVoiceQueuesOrDgSelected) {
                return t(
                    'PHONE.JUPITER.EMPTY_PAGE.NO_QUEUE_AND_DIAL_GROUP_SELECTED'
                );
            } else {
                return t('PHONE.JUPITER.EMPTY_PAGE.TITLE');
            }
        }, [isEmptyVoiceQueuesOrDgSelected, t]);

        const getSubText = useCallback(() => {
            if (isEmptyVoiceQueuesOrDgSelected) {
                return t(
                    'PHONE.JUPITER.EMPTY_PAGE.START_HANDLING_INTERACTIONS'
                );
            } else if (isOutboundCallEnabled) {
                return t('PHONE.JUPITER.EMPTY_PAGE.SUBTEXT');
            } else {
                return t('PHONE.JUPITER.EMPTY_PAGE.NO_OUTBOUND_SUB_TITLE');
            }
        }, [isEmptyVoiceQueuesOrDgSelected, isOutboundCallEnabled, t]);

        const button = getButton();
        const text = getText();
        const subText = getSubText();

        return (
            <Splash
                {...{
                    text,
                    subText,
                    icon: <EmptyStateImage type={iconType} />,
                    button,
                    splashType: SPLASH_TYPES.SIDE_PANEL,
                }}
            />
        );
    }
);
