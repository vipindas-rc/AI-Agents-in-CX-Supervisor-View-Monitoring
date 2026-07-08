import { forwardRef, useCallback, Fragment, type KeyboardEvent } from 'react';

import { DateTime, Languages } from '@ringcx/shared';
import { KEYBOARD_KEYS, TextEclipse } from '@ringcx/ui';
import { Settings } from 'luxon';
import { useTranslation } from 'react-i18next';

import {
    SessionContent,
    SessionItem,
    SessionLabel,
    SessionLabelValue,
    Divider,
    UpdateSessionButton,
} from './SessionInfo.styled';
import type { ISessionInfoProps } from './types/SessionInfo';
import {
    SESSION_INFO_LOGIN_ID,
    SESSION_INFO_LOGIN_TYPE,
    SESSION_INFO_PHONE_ID,
    SESSION_INFO_LOGIN_DTS,
} from '../../../../constants/testIds';
import { SYSTEM_AGENT_STATES_AND_LABELS } from '../../../../helpers/agentState';
import injector from '../../../../helpers/injector';
import translate from '../../../../helpers/translate';

const SessionInfo = forwardRef<HTMLButtonElement, ISessionInfoProps>(
    (
        {
            agentSettings,
            profileName,
            dialGroupName,
            chatState,
            updateLogin,
            agentPermissions,
            className,
            dialDestination,
            onCloseSubmenu,
            AgentSvc,
        },
        ref
    ) => {
        const localizedPresetFormat =
            Settings.defaultLocale === Languages.FR_CA
                ? DateTime.DATETIME_FORMAT.LOCALISED_DATE_TIME_SHORT_24_HOUR
                : null;

        const sessionLoginDTS = DateTime.localizedDateTimeFromObject({
            dateTime: DateTime.fromJSDate(agentSettings.loginDTS),
            toLocalizedPresetFormat: DateTime.PRESET.DATETIME_SHORT,
            format: localizedPresetFormat,
        });
        const { t } = useTranslation();
        const isPreviewing = AgentSvc?.isPreviewing() || false;

        const onHandleUpdateLogin = useCallback(() => {
            const AnalyticsSvc = injector('AnalyticsSvc');
            AnalyticsSvc.track(
                'RCX_more_settings_sessionInfo_updateSession_update'
            );
            updateLogin();
        }, [updateLogin]);

        const handleUpdateButtonKeyDown = useCallback(
            (e: KeyboardEvent<HTMLButtonElement>) => {
                if (
                    e.key === KEYBOARD_KEYS.ARROW_LEFT ||
                    e.key === KEYBOARD_KEYS.ESCAPE
                ) {
                    e.preventDefault();
                    onCloseSubmenu?.();
                }
            },
            [onCloseSubmenu]
        );

        return (
            <SessionContent className={className}>
                <SessionItem>
                    <SessionLabel>{translate('NAV.USER.PHONE')}</SessionLabel>
                    <SessionLabelValue data-aid={SESSION_INFO_PHONE_ID}>
                        <TextEclipse tooltipMsg={dialDestination}>
                            {dialDestination}
                        </TextEclipse>
                    </SessionLabelValue>
                </SessionItem>

                {agentSettings.phoneLoginPin && (
                    <SessionItem>
                        <SessionLabel>
                            {translate('NAV.USER.LOGIN_PIN')}
                        </SessionLabel>
                        <SessionLabelValue data-aid={SESSION_INFO_LOGIN_ID}>
                            {agentSettings.phoneLoginPin}
                        </SessionLabelValue>
                    </SessionItem>
                )}
                <SessionItem>
                    <SessionLabel>
                        {translate('NAV.USER.LOGIN_TYPE')}
                    </SessionLabel>
                    <SessionLabelValue data-aid={SESSION_INFO_LOGIN_TYPE}>
                        {t('NAV.LOGIN_TYPES.' + agentSettings.loginType)}
                    </SessionLabelValue>
                </SessionItem>
                <SessionItem data-aid={SESSION_INFO_LOGIN_DTS}>
                    <SessionLabel>
                        {translate('NAV.USER.LOGIN_DTS')}
                    </SessionLabel>
                    <SessionLabelValue>{sessionLoginDTS}</SessionLabelValue>
                </SessionItem>
                <SessionItem>
                    <SessionLabel>
                        {translate('NAV.USER.SKILL_PROFILE')}
                    </SessionLabel>
                    <SessionLabelValue>{profileName}</SessionLabelValue>
                </SessionItem>
                <SessionItem>
                    <SessionLabel>
                        {translate('NAV.USER.DIAL_GROUP')}
                    </SessionLabel>
                    <SessionLabelValue>{dialGroupName}</SessionLabelValue>
                </SessionItem>
                {chatState.currentState &&
                    chatState.currentState.toUpperCase() !== 'NONE' && (
                        <SessionItem>
                            <SessionLabel>
                                {translate('NAV.USER.CHAT_STATE')}
                            </SessionLabel>
                            <SessionLabelValue>
                                {SYSTEM_AGENT_STATES_AND_LABELS.includes(
                                    chatState.currentState
                                )
                                    ? t(
                                          'AGENT_STATES.' +
                                              chatState.currentState
                                      )
                                    : chatState.currentState}
                            </SessionLabelValue>
                        </SessionItem>
                    )}

                {agentPermissions.allowLoginUpdates ? (
                    <Fragment>
                        <Divider />
                        <UpdateSessionButton
                            ref={ref}
                            data-aid='update-session-button'
                            onClick={onHandleUpdateLogin}
                            onKeyDown={handleUpdateButtonKeyDown}
                            role='button'
                            tabIndex={0}
                            disabled={isPreviewing}
                        >
                            {translate('NAV.UPDATE_SESSION')}
                        </UpdateSessionButton>
                    </Fragment>
                ) : null}
            </SessionContent>
        );
    }
);

SessionInfo.displayName = 'SessionInfo';

export default SessionInfo;
