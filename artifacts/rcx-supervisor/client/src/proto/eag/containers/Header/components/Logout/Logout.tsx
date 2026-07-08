import type { FC } from 'react';
import { useCallback, useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';

import { LogoutMenu } from './Logout.styled';
import type { ILogoutProps } from './types/Logout';
import { checkBlock } from '../../../../common/services/history/history.service';
import { LOGOUT_ID } from '../../../../constants/testIds';
import injector from '../../../../helpers/injector';
import { onClickLogout } from '../../helpers/header.service';

export const Logout: FC<ILogoutProps> = ({
    AuthService,
    AgentSvc,
    firstLogin = false,
}) => {
    const { t } = useTranslation();
    const logoutText = t('NAV.SIGN_OUT');
    const [isPreviewing, setIsPreviewing] = useState(
        () => AgentSvc?.isPreviewing() || false
    );

    const handleLogout = useCallback(() => {
        const AnalyticsSvc = injector('AnalyticsSvc');
        AnalyticsSvc.track('RCX_more_signOut');
        checkBlock().catch(() => {
            AuthService.logout();
            AnalyticsSvc.reset();
        });
    }, [AuthService]);

    useEffect(() => {
        const $rootScope = injector('$rootScope');
        const AGENT_EVENTS = injector('AGENT_EVENTS');

        const unsubscribeStateChanged = $rootScope.$on(
            AGENT_EVENTS.STATE_CHANGED,
            () => {
                setIsPreviewing(AgentSvc?.isPreviewing() || false);
            }
        );

        return () => {
            unsubscribeStateChanged();
        };
    }, []);

    return firstLogin ? (
        <LogoutMenu onClick={onClickLogout} role='button' tabIndex={0}>
            {logoutText}
        </LogoutMenu>
    ) : (
        <LogoutMenu
            className='logout'
            data-aid={LOGOUT_ID}
            onClick={handleLogout}
            role='button'
            tabIndex={0}
            disabled={isPreviewing}
        >
            {logoutText}
        </LogoutMenu>
    );
};
