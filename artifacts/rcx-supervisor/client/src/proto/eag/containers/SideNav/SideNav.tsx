import type { FC } from 'react';
import { useMemo, useEffect, useRef } from 'react';

import {
    SideNav as EuiSideNav,
    useHashWatcher,
    isActivationKey,
    isTabKey,
} from '@ringcx/ui';
import { useWindowSize } from 'react-use';

import { getNavItems } from './helpers/sideNav.service';
import { useSideNavScopeWatcher } from './hooks/useSideNavScopeWatcher';
import type { INavComponentProps } from './types/SideNav';
import { RESPONSIVE_BREAKPOINT } from '../../constants/app';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { useTrackNavigationAnalytics } from '../../helpers/useTrackNavigationAnalytics';

const FOCUSABLE_SELECTOR =
    'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export const SideNav: FC<INavComponentProps> = ({
    $state,
    $rootScope,
    AgentSvc,
    AnalyticsSvc,
    AuthService,
    OutboundSvc,
    ChatSvc,
    MonitorSvc,
    expanded,
    CHAT_EVENTS,
    PriorityCategoriesNotificationSvc,
}) => {
    const { width } = useWindowSize();
    const isHorizontal = useMemo(() => width <= RESPONSIVE_BREAKPOINT, [width]);
    const currentRoute = useHashWatcher();

    useTrackNavigationAnalytics(currentRoute, AnalyticsSvc);

    const previousRoute = useRef(currentRoute);
    const lastActiveMenuItem = useRef<HTMLElement | null>(null);
    const timeoutRef = useRef<number>();
    const wasKeyboardNavigation = useRef(false);

    useEffect(() => {
        const handleMenuInteraction = (event: Event) => {
            const target = event.target as HTMLElement;

            const menuItem = target.closest('[data-aid="eui-nav-menu-item"]');

            if (menuItem) {
                const menuLink = menuItem.querySelector(
                    'a[href]'
                ) as HTMLElement;

                if (menuLink) {
                    lastActiveMenuItem.current = menuLink;
                    return;
                }
            }

            const link = target.closest('a[href]') as HTMLElement;
            if (link && link.closest('side-nav')) {
                lastActiveMenuItem.current = link;
            }
        };

        const handleMenuKeyDown = (event: KeyboardEvent) => {
            if (isActivationKey(event.key)) {
                const target = event.target as HTMLElement;
                const menuItem = target.closest(
                    '[data-aid="eui-nav-menu-item"]'
                );

                if (menuItem && menuItem.closest('side-nav')) {
                    wasKeyboardNavigation.current = true;
                }

                handleMenuInteraction(event);
            }
        };

        const handleMenuClick = (event: MouseEvent) => {
            handleMenuInteraction(event);
        };

        document.addEventListener('click', handleMenuClick, true);
        document.addEventListener('keydown', handleMenuKeyDown, true);

        return () => {
            document.removeEventListener('click', handleMenuClick, true);
            document.removeEventListener('keydown', handleMenuKeyDown, true);
        };
    }, []);

    useEffect(() => {
        if (previousRoute.current !== currentRoute) {
            previousRoute.current = currentRoute;

            if (wasKeyboardNavigation.current) {
                const startedAt = Date.now();
                const maxWait = 2000;
                const retryDelay = 100;
                const sideNav = document.querySelector('side-nav');

                const attemptFocus = () => {
                    const mainContent = document.getElementById('main-content');

                    if (!mainContent) {
                        if (Date.now() - startedAt < maxWait) {
                            timeoutRef.current = window.setTimeout(
                                attemptFocus,
                                retryDelay
                            );
                        } else {
                            wasKeyboardNavigation.current = false;
                        }

                        return;
                    }

                    const activeElement =
                        document.activeElement as HTMLElement | null;

                    if (
                        activeElement &&
                        activeElement !== document.body &&
                        !mainContent.contains(activeElement) &&
                        !(sideNav && sideNav.contains(activeElement))
                    ) {
                        wasKeyboardNavigation.current = false;
                        return;
                    }

                    const focusableElements =
                        mainContent.querySelectorAll(FOCUSABLE_SELECTOR);

                    if (focusableElements.length > 0) {
                        (focusableElements[0] as HTMLElement).focus();
                        wasKeyboardNavigation.current = false;
                        return;
                    }

                    if (Date.now() - startedAt < maxWait) {
                        timeoutRef.current = window.setTimeout(
                            attemptFocus,
                            retryDelay
                        );
                    } else {
                        mainContent.focus();
                        wasKeyboardNavigation.current = false;
                    }
                };

                attemptFocus();
            }
        }

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [currentRoute]);

    useEffect(() => {
        const mainContent = document.getElementById('main-content');
        if (!mainContent) return;

        const handleKeyDown = (event: KeyboardEvent) => {
            if (
                event.shiftKey &&
                isTabKey(event.key) &&
                lastActiveMenuItem.current &&
                document.contains(lastActiveMenuItem.current)
            ) {
                const activeElement = document.activeElement as HTMLElement;
                const sideNav = document.querySelector('side-nav');

                const isCurrentInSideNav =
                    sideNav && sideNav.contains(activeElement);

                if (isCurrentInSideNav) {
                    return;
                }

                const allFocusableElements = Array.from(
                    document.querySelectorAll(FOCUSABLE_SELECTOR)
                ) as HTMLElement[];

                const currentIndex =
                    allFocusableElements.indexOf(activeElement);
                const previousElement = allFocusableElements[currentIndex - 1];

                const isPreviousInSideNav =
                    previousElement && sideNav?.contains(previousElement);

                if (isPreviousInSideNav) {
                    event.preventDefault();
                    event.stopPropagation();
                    requestAnimationFrame(() => {
                        if (lastActiveMenuItem.current) {
                            lastActiveMenuItem.current.focus();
                        }
                    });
                }
            }
        };

        document.addEventListener('keydown', handleKeyDown, true);

        return () => {
            document.removeEventListener('keydown', handleKeyDown, true);
        };
    }, []);

    const refreshNav = useSideNavScopeWatcher(
        $rootScope,
        AgentSvc,
        ChatSvc,
        MonitorSvc,
        OutboundSvc,
        CHAT_EVENTS,
        PriorityCategoriesNotificationSvc
    );

    const navItems = useMemo(
        () => {
            return getNavItems(
                $state,
                AgentSvc,
                OutboundSvc,
                ChatSvc,
                AuthService,
                isHorizontal,
                $rootScope.isInCRM(),
                $rootScope.crmFeedbackSetOpen,
                PriorityCategoriesNotificationSvc
            );
        }, // eslint-disable-next-line
        [
            AgentSvc,
            OutboundSvc,
            ChatSvc,
            $state,
            refreshNav,
            isHorizontal,
            // refreshNav is needed as dependency to up properly watch the state
        ]
    );

    return useMemo(
        () => (
            <EuiSideNav
                {...{
                    currentRoute,
                    expanded,
                    navItems,
                    showItemTooltip: true,
                    layout: isHorizontal ? 'horizontal' : 'vertical',
                    showSubMenuHeader: !$rootScope.isInCRM(),
                }}
            />
        ),
        [currentRoute, expanded, navItems, isHorizontal, $rootScope]
    );
};

export default CreateAngularModule(
    'sideNav',
    SideNav,
    ['expanded'],
    [
        '$state',
        '$rootScope',
        'AgentSvc',
        'AuthService',
        'OutboundSvc',
        'ChatSvc',
        'MonitorSvc',
        'CHAT_EVENTS',
        'AnalyticsSvc',
        'PriorityCategoriesNotificationSvc',
    ]
);
