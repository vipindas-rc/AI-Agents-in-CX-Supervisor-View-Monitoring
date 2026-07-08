import type { FC, PropsWithChildren } from 'react';
import { useMemo } from 'react';

import { useTranslation } from 'react-i18next';

import Tooltip from './../../components/Tooltip';
import Logo from './components/Logo/Logo';
import UserMenu from './components/UserMenu/UserMenu';
import {
    TopPanelDivider,
    StyledIconButton,
    TopPanelContainer,
    UserMenuWrapper,
    TopPanelActionsWrapper,
} from './TopPanel.styled';
import type { ITopPanel } from './types';
import { TEST_AID } from '../../constants';
import { Hamburger } from '../../icons';
import { i18next } from '../../services/translate';
import AppSwitcher from '../AppSwitcher';

const TopPanel: FC<PropsWithChildren<ITopPanel>> = ({
    defaultLogo,
    appSwitcherLabels,
    isOpenMenu = false,
    toggleMenuCallback,
    logoOnClick,
    mainAccountId,
    subAccountId,
    userMenuData = null,
    disableAppSwitcher,
    disableActions = false,
    loading = false,
    rcAccountId = '',
    children,
    isCRMScreen = false,
    onTrackAnalytics,
    portalType,
    onWEMNotConfigured,
    accessibilityLabels,
    rightActions,
    ...props
}) => {
    const { t } = useTranslation(undefined, { i18n: i18next });

    const renderUserMenu = useMemo(() => {
        if (userMenuData) {
            const { userMenuContainer, items, userData } = userMenuData;

            return (
                <UserMenu
                    userMenuContainer={userMenuContainer}
                    items={items}
                    userData={userData}
                    loading={loading}
                />
            );
        }

        return null;
    }, [userMenuData, loading]);

    const renderHamburgerMenu = useMemo(() => {
        return (
            <StyledIconButton
                aria-label={t('ARIA_LABELS.MENU')}
                onClick={toggleMenuCallback}
                isOpenMenu={isOpenMenu}
                data-aid={TEST_AID.MENU_HAMBURGER}
            >
                <Hamburger />
            </StyledIconButton>
        );
    }, [isOpenMenu]);

    return (
        <TopPanelContainer {...props}>
            {toggleMenuCallback &&
                !isCRMScreen &&
                (accessibilityLabels?.menuHamburger ? (
                    <Tooltip
                        title={
                            isOpenMenu
                                ? accessibilityLabels.menuHamburger.collapse
                                : accessibilityLabels.menuHamburger.expand
                        }
                    >
                        {renderHamburgerMenu}
                    </Tooltip>
                ) : (
                    renderHamburgerMenu
                ))}
            {!isCRMScreen && (
                <Logo
                    mainAccountId={mainAccountId}
                    subAccountId={subAccountId}
                    onClick={logoOnClick}
                    defaultLogo={defaultLogo}
                    withToggle={!!toggleMenuCallback}
                />
            )}

            {!disableActions && (
                <TopPanelActionsWrapper
                    className='top-panel-actions-wrapper'
                    data-aid={TEST_AID.TOP_PANEL_ACTIONS}
                >
                    {children}
                    {children && !isCRMScreen && (
                        <TopPanelDivider loading={loading} />
                    )}
                    {rightActions}
                    {!isCRMScreen && (
                        <UserMenuWrapper>{renderUserMenu}</UserMenuWrapper>
                    )}
                    {!disableAppSwitcher && !isCRMScreen && (
                        <AppSwitcher
                            {...{
                                loading,
                                rcAccountId,
                                labels: appSwitcherLabels,
                                onTrackAnalytics,
                                portalType,
                                onWEMNotConfigured,
                                accessibilityLabels,
                            }}
                        />
                    )}
                </TopPanelActionsWrapper>
            )}
        </TopPanelContainer>
    );
};

export default TopPanel;
