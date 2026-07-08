import type { FC, MouseEvent, KeyboardEvent } from 'react';
import {
    Fragment,
    useCallback,
    useEffect,
    useMemo,
    useState,
    useRef,
} from 'react';

import type { ProblemReportData } from '@ringcx/shared';
import {
    wemPortals,
    ProductType,
    UserService,
    WHATS_NEW_LINK,
    RC_SUBMIT_AN_IDEA,
    DigitalJWTModifier,
    ONLINE_TRAINING_LINK,
    DEFAULT_AT_T_LINK,
    isBiz,
    isReportAnIssueAvailable,
} from '@ringcx/shared';
import {
    KEYBOARD_KEYS,
    Toast,
    CaretRight,
    useReportAnIssue,
    InternalMessaging,
    SUB_ACCOUNTS_TO_ENABLE_HARD_LOG,
} from '@ringcx/ui';
import { useTranslation } from 'react-i18next';

import { AgentState, SessionInfo, Timer } from './components';
import { Logout } from './components/Logout/Logout';
import {
    DELAY,
    HARD_LOG_KEY,
    AGENT_LOGO_NAME,
    RC_SUPPORT_AGENT,
} from './constants';
import {
    StyledSwitch,
    StyledTopPanel,
    SessionInfoText,
    TopPanelDivider,
    SubMenuItemContent,
} from './Header.styled';
import { useCurrentStateWatcher } from './hooks';
import type { IHeader } from './types/Header';
import { AgentCprClient } from '../../common/services/problemReport';
import { ScreenRecordingStatus } from '../../components/ScreenRecording/ScreenRecordingStatus/ScreenRecordingStatus';
import { SWITCH_SIZE, RESPONSIVE_BREAKPOINT } from '../../constants/app';
import {
    SESSION_INFO_ID,
    TOGGLE_CALL_CONNECTION_STATUS,
} from '../../constants/testIds';
import CreateAngularModule from '../../helpers/CreateAngularModule';

let debounceTimeout: ReturnType<typeof setTimeout>;

export const Header: FC<IHeader> = ({
    AnalyticsSvc,
    AuthService,
    AgentSvc,
    CallSvc,
    connectionStatus,
    ChatSvc,
    AcdSvc,
    ChromeSvc,
    OutboundSvc,
    $rootScope,
    ssoLogin,
    handleToggleLeftMenu,
    handleUpdateLogin,
    showBreakTimer,
    breakTimeExpired,
    breakWaitTime,
    breakOver,
    handleStateChange,
    firstLogin = false,
    isEmbedded,
    AGENT_EVENTS,
}) => {
    const { t } = useTranslation();
    const appSwitcherLabels = useMemo(
        () => ({
            AGENT: t('APP_SWITCHER.AGENT'),
            ANALYTICS: t('APP_SWITCHER.ANALYTICS'),
            ADMIN: t('APP_SWITCHER.ADMIN'),
            WEM: t('APP_SWITCHER.WEM'),
            AI: t('APP_SWITCHER.AI'),
            ENGAGE: t('APP_SWITCHER.ENGAGE'),
        }),
        [t]
    );
    const toast = Toast();

    const [isOpenMenu, setIsOpenMenu] = useState<boolean>(
        AgentSvc.openMenuState
    );
    const [disableAppSwitcher, setDisableAppSwitcher] = useState(true);
    const [showSubMenu, setShowSubMenu] = useState<boolean>(false);
    const { agentSettings } = AgentSvc;
    const updateSessionButtonRef = useRef<HTMLButtonElement>(null);

    const [isCRMScreen, setIsCRMScreen] = useState(
        window.innerWidth <= RESPONSIVE_BREAKPOINT
    );

    useEffect(() => {
        const handleResize = () => {
            setIsCRMScreen(window.innerWidth <= RESPONSIVE_BREAKPOINT);
        };

        window.addEventListener('resize', handleResize);

        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    useEffect(() => {
        setDisableAppSwitcher(!ssoLogin);
    }, [ssoLogin]);

    const handleMenuOpen = useCallback(() => {
        handleToggleLeftMenu();
        setIsOpenMenu(!isOpenMenu);
    }, [isOpenMenu, handleToggleLeftMenu]);

    const onHandleUpdateLogin = useCallback(() => {
        handleUpdateLogin();
        setShowSubMenu(false);
    }, [handleUpdateLogin]);

    $rootScope.$on('$destroy', function () {
        unregisterStateChanged();
    });
    const onStateChange = (event: any, data: any) => {
        handleStateChange(event, data);
    };
    const unregisterStateChanged = $rootScope.$on(
        AGENT_EVENTS.STATE_CHANGED,
        onStateChange
    );

    const refreshTimer = useCurrentStateWatcher($rootScope, AgentSvc);

    const toggleSubMenu = useCallback((isOpen: boolean) => {
        clearTimeout(debounceTimeout);
        debounceTimeout = setTimeout(() => {
            setShowSubMenu(isOpen);
        }, DELAY);
    }, []);

    const handleSessionInfoKeyDown = useCallback(
        (e: KeyboardEvent<HTMLElement>) => {
            if (e.key === KEYBOARD_KEYS.ARROW_RIGHT) {
                e.preventDefault();
                setShowSubMenu(true);
                setTimeout(() => {
                    updateSessionButtonRef.current?.focus();
                }, 0);
            } else if (
                e.key === KEYBOARD_KEYS.ARROW_DOWN ||
                e.key === KEYBOARD_KEYS.ARROW_UP
            ) {
                setShowSubMenu(false);
            }
        },
        []
    );

    const dialDestination = useMemo(
        () => AgentSvc.getFormattedDialDest(),
        [AgentSvc]
    );

    const logout = useMemo(
        () => <Logout {...{ firstLogin, AuthService, AgentSvc }} />,
        [firstLogin, AuthService, AgentSvc]
    );

    const [mainAccountId, subAccountId, rcAccountId, agentId] = useMemo(() => {
        const fullUserDetails = UserService.getFullUserDetails();

        const subAccountId = AgentSvc.agentSettings.accountId || '';
        const mainAccountId = fullUserDetails.evMainAccountId || '';
        const rcAccountId = fullUserDetails.rcAccountId || '';
        const agentId = AgentSvc.agentSettings.agentId || '';

        return [mainAccountId, subAccountId, rcAccountId, agentId];
    }, [AgentSvc.agentSettings.accountId, AgentSvc.agentSettings.agentId]);

    const sessionInfoTextRef = useRef<HTMLDivElement>(null);

    const handleCloseSubmenu = useCallback(() => {
        setShowSubMenu(false);
        // Return focus to Session info parent
        setTimeout(() => {
            sessionInfoTextRef.current?.focus();
        }, 0);
    }, []);

    const sessionInfo = useMemo(() => {
        const notApplicableText = t('NAV.NOT_APP');
        const dialGroupName =
            OutboundSvc.outboundSettings.outdialGroup.dialGroupName ||
            notApplicableText;
        const profileName =
            AcdSvc.inboundSettings.skillProfile.profileName ||
            notApplicableText;

        return (
            <Fragment>
                <SubMenuItemContent
                    onMouseEnter={() => toggleSubMenu(true)}
                    onMouseLeave={() => toggleSubMenu(false)}
                    showSubMenu={showSubMenu}
                >
                    <SessionInfo
                        ref={updateSessionButtonRef}
                        agentSettings={agentSettings}
                        chatState={ChatSvc.chatState}
                        profileName={profileName}
                        dialGroupName={dialGroupName}
                        updateLogin={onHandleUpdateLogin}
                        agentPermissions={AgentSvc.agentPermissions}
                        dialDestination={dialDestination}
                        onCloseSubmenu={handleCloseSubmenu}
                        AgentSvc={AgentSvc}
                    />
                </SubMenuItemContent>
                <SessionInfoText
                    ref={sessionInfoTextRef}
                    onMouseEnter={() => toggleSubMenu(true)}
                    onMouseLeave={() => toggleSubMenu(false)}
                    onClick={() => setShowSubMenu(!showSubMenu)}
                    onKeyDown={handleSessionInfoKeyDown}
                    data-aid={SESSION_INFO_ID}
                    role='button'
                    tabIndex={0}
                    aria-haspopup='menu'
                    aria-expanded={showSubMenu}
                >
                    <span>{t('NAV.AGENT_MENU.SESSION_INFO')}</span>
                    <CaretRight />
                </SessionInfoText>
            </Fragment>
        );
    }, [
        t,
        OutboundSvc.outboundSettings.outdialGroup.dialGroupName,
        AcdSvc.inboundSettings.skillProfile.profileName,
        showSubMenu,
        agentSettings,
        toggleSubMenu,
        handleSessionInfoKeyDown,
        onHandleUpdateLogin,
        dialDestination,
        AgentSvc.agentPermissions,
        ChatSvc.chatState,
        handleCloseSubmenu,
    ]);

    const handleSubmit = async (reportData: ProblemReportData) => {
        await AgentCprClient.getInstance().handleProblemReportSubmit(
            ProductType.RCX,
            reportData
        );
    };

    const [reportAnIssueButton, reportAnIssueModal] =
        useReportAnIssue(handleSubmit);

    const isHardLogEnabled = useMemo(() => {
        const isEnabledInStorage =
            localStorage.getItem(HARD_LOG_KEY) === 'true';
        return (
            isEnabledInStorage ||
            SUB_ACCOUNTS_TO_ENABLE_HARD_LOG.includes(subAccountId)
        );
    }, [subAccountId]);

    const getHardLog = useCallback(
        (event: MouseEvent<HTMLAnchorElement>) => {
            event.preventDefault();

            AgentSvc.getHardLogs();
        },
        [AgentSvc]
    );

    const userMenuData = useMemo(() => {
        const trackUserMenu = (type: string) => {
            AnalyticsSvc.track('RCX_userMenu_Options', {
                type: type,
            });
        };

        return {
            userData: {
                firstName: agentSettings.firstName,
                lastName: agentSettings.lastName,
                email: agentSettings.username,
                fullName:
                    `${agentSettings.firstName} ${agentSettings.lastName}`.trim(),
            },
            items: [
                {
                    title: t('NAV.AGENT_MENU.NEED_HELP'),
                    to: isBiz() ? DEFAULT_AT_T_LINK : RC_SUPPORT_AGENT,
                    isExternal: true,
                    onClick: () => {
                        trackUserMenu(
                            t('NAV.AGENT_MENU.NEED_HELP', { lng: 'en-US' })
                        );
                    },
                },
                {
                    title: t('NAV.AGENT_MENU.WHATS_NEW'),
                    to: isBiz() ? DEFAULT_AT_T_LINK : WHATS_NEW_LINK,
                    isExternal: true,
                    onClick: () => {
                        trackUserMenu(
                            t('NAV.AGENT_MENU.WHATS_NEW', { lng: 'en-US' })
                        );
                    },
                },
                {
                    title: t('NAV.AGENT_MENU.ONLINE_TRAINING'),
                    to: ONLINE_TRAINING_LINK,
                    isExternal: true,
                    onClick: () => {
                        trackUserMenu(
                            t('NAV.AGENT_MENU.ONLINE_TRAINING', {
                                lng: 'en-US',
                            })
                        );
                    },
                },
                {
                    component: isReportAnIssueAvailable(mainAccountId)
                        ? reportAnIssueButton
                        : null,
                },
                {
                    component: isHardLogEnabled ? (
                        <a
                            href='#hard-log'
                            onClick={getHardLog}
                            role='button'
                            tabIndex={0}
                        >
                            Download hard log
                        </a>
                    ) : null,
                },
                {
                    title: t('NAV.AGENT_MENU.SUBMIT_IDEA'),
                    to: isBiz() ? DEFAULT_AT_T_LINK : RC_SUBMIT_AN_IDEA,
                    isExternal: true,
                    onClick: () => {
                        trackUserMenu(
                            t('NAV.AGENT_MENU.SUBMIT_IDEA', {
                                lng: 'en-US',
                            })
                        );
                    },
                },
                {
                    component: !firstLogin && sessionInfo,
                },
                {
                    component: !isEmbedded && logout,
                },
            ],
        };
    }, [
        agentSettings.firstName,
        agentSettings.lastName,
        agentSettings.username,
        t,
        mainAccountId,
        reportAnIssueButton,
        isHardLogEnabled,
        getHardLog,
        firstLogin,
        sessionInfo,
        isEmbedded,
        logout,
        AnalyticsSvc,
    ]);

    const agentTimer = useMemo(
        () => (
            <Timer
                {...{
                    showBreakTimer,
                    breakTimeExpired,
                    breakWaitTime,
                    breakOver,
                    refreshTimer,
                    ChromeSvc,
                    $rootScope,
                }}
            />
        ),
        [
            showBreakTimer,
            breakTimeExpired,
            breakWaitTime,
            breakOver,
            refreshTimer,
            ChromeSvc,
            $rootScope,
        ]
    );

    const onTrackAnalytics = useCallback(
        (event: string, properties?: Record<string, unknown>) => {
            AnalyticsSvc.track(event, properties);
        },
        [AnalyticsSvc]
    );
    const onWEMNotConfigured = useCallback(() => {
        toast.error({
            text: t('ERROR_MESSAGE.WEM_URL_NOT_CONFIGURED'),
            hasCloseButton: true,
        });
    }, [t, toast]);
    const agentHeader = useMemo(
        () => (
            <StyledTopPanel
                {...{
                    defaultLogo: AGENT_LOGO_NAME,
                    isOpenMenu,
                    toggleMenuCallback: handleMenuOpen,
                    userMenuData,
                    mainAccountId,
                    subAccountId,
                    rcAccountId,
                    disableAppSwitcher,
                    appSwitcherLabels,
                    isCRMScreen,
                    onTrackAnalytics,
                    portalType: wemPortals.AGENT,
                    onWEMNotConfigured,
                    accessibilityLabels: {
                        menuHamburger: {
                            collapse: t(
                                'NAV.TOP_PANEL.HAMBURGER_MENU_COLLAPSE'
                            ),
                            expand: t('NAV.TOP_PANEL.HAMBURGER_MENU_EXPAND'),
                        },
                        appSwitcher: {
                            open: t('NAV.TOP_PANEL.APP_SWITCHER_OPEN'),
                            close: t('NAV.TOP_PANEL.APP_SWITCHER_CLOSE'),
                        },
                    },
                }}
            >
                <Fragment>
                    {reportAnIssueModal}
                    <AgentState AgentSvc={AgentSvc}>{agentTimer}</AgentState>
                    {ssoLogin && (
                        <InternalMessaging
                            digitalJWTModifier={DigitalJWTModifier.AGENT}
                            agentId={agentId}
                        />
                    )}
                    {isCRMScreen && (
                        <Fragment>
                            <TopPanelDivider></TopPanelDivider>
                            <StyledSwitch
                                data-aid={TOGGLE_CALL_CONNECTION_STATUS}
                                size={SWITCH_SIZE.SMALL}
                                checked={connectionStatus}
                                onChange={CallSvc.toggleOffHook}
                                inputProps={{
                                    'aria-label': t(
                                        'NAV.TOP_PANEL.TOGGLE_OFF_HOOK'
                                    ),
                                }}
                            ></StyledSwitch>
                        </Fragment>
                    )}
                </Fragment>
            </StyledTopPanel>
        ),
        [
            reportAnIssueModal,
            isOpenMenu,
            handleMenuOpen,
            userMenuData,
            mainAccountId,
            subAccountId,
            rcAccountId,
            isCRMScreen,
            disableAppSwitcher,
            appSwitcherLabels,
            AgentSvc,
            agentTimer,
            connectionStatus,
            CallSvc.toggleOffHook,
            onWEMNotConfigured,
            onTrackAnalytics,
            agentId,
            ssoLogin,
            t,
        ]
    );

    const sessionInfoHeader = useMemo(() => {
        return (
            <StyledTopPanel
                {...{
                    defaultLogo: AGENT_LOGO_NAME,
                    userMenuData,
                    disableAppSwitcher: true,
                    portalType: wemPortals.AGENT,
                    onWEMNotConfigured,
                    accessibilityLabels: {
                        menuHamburger: {
                            collapse: t(
                                'NAV.TOP_PANEL.HAMBURGER_MENU_COLLAPSE'
                            ),
                            expand: t('NAV.TOP_PANEL.HAMBURGER_MENU_EXPAND'),
                        },
                    },
                }}
            />
        );
    }, [userMenuData, onWEMNotConfigured, t]);

    return !firstLogin ? agentHeader : sessionInfoHeader;
};

export default CreateAngularModule(
    'rootHeader',
    Header,
    [
        'handleToggleLeftMenu',
        'handleUpdateLogin',
        'ssoLogin',
        'showBreakTimer',
        'breakTimeExpired',
        'breakWaitTime',
        'breakOver',
        'firstLogin',
        'handleStateChange',
        'isEmbedded',
        'connectionStatus',
    ],
    [
        'AnalyticsSvc',
        '$rootScope',
        'AgentSvc',
        'AuthService',
        'CallSvc',
        'ChatSvc',
        'OutboundSvc',
        'AcdSvc',
        'ChromeSvc',
        'AGENT_EVENTS',
    ]
);
