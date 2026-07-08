import type { ChangeEvent, FC } from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { useHashWatcher } from '@ringcx/ui';

import { JupiterTabs } from './components';
import { useJupiterNavItems } from './hooks/useJupiterNavItems';
import { JupiterSideNavWrapper } from './JupiterSideNav.styled';
import type { JupiterSideNavProps } from './types';
import CreateAngularModule from '../../helpers/CreateAngularModule';
import { useTrackNavigationAnalytics } from '../../helpers/useTrackNavigationAnalytics';
import { withBrandTheme } from '../../helpers/withBrandTheme';

export const JupiterSideNav: FC<JupiterSideNavProps> = withBrandTheme(
    ({
        $state,
        $rootScope,
        AgentSvc,
        OutboundSvc,
        ChatSvc,
        MonitorSvc,
        AnalyticsSvc,
        CHAT_EVENTS,
        PriorityCategoriesNotificationSvc,
        SUPERVISOR_EVENTS,
    }) => {
        const currentRoute = useHashWatcher();

        // In Jupiter incognito, $state.go uses doesn't trigger hashchange event
        // So we need to listen to $stateChangeSuccess and force re-calculation of currentItemIndex
        const [stateChangeCounter, setStateChangeCounter] = useState(0);

        useEffect(() => {
            const unsubscribe = $rootScope.$on('$stateChangeSuccess', () => {
                // Force re-render by updating counter
                setStateChangeCounter((prev) => prev + 1);
            });

            return () => {
                unsubscribe();
            };
        }, [$rootScope]);

        const { items } = useJupiterNavItems({
            $state,
            $rootScope,
            AgentSvc,
            OutboundSvc,
            ChatSvc,
            MonitorSvc,
            CHAT_EVENTS,
            PriorityCategoriesNotificationSvc,
            SUPERVISOR_EVENTS,
        });

        const currentItemIndex = useMemo(() => {
            const currentHash = window.location.hash;
            const index = items.findIndex(({ route: { href } }) => {
                return currentHash.includes(href);
            });
            return index;
        }, [items, stateChangeCounter]); // DO NOT REMOVE stateChangeCounter

        useTrackNavigationAnalytics(currentRoute, AnalyticsSvc);

        const onChange = useCallback(
            (_: ChangeEvent<Record<string, unknown>>, value: string) => {
                const isRepeatedInteractionTabClick =
                    value === 'interaction' &&
                    items[currentItemIndex]?.value === value;

                if (isRepeatedInteractionTabClick) {
                    return;
                }

                const item = items.find((el) => el.value === value);
                const routeName = item?.route.name;
                routeName && $state.go(routeName);
            },
            [$state, items, currentItemIndex]
        );

        return useMemo(
            () => (
                <JupiterSideNavWrapper>
                    <JupiterTabs
                        value={items[currentItemIndex]?.value ?? ''}
                        tabs={items}
                        onChange={onChange}
                    />
                </JupiterSideNavWrapper>
            ),
            [currentItemIndex, items, onChange]
        );
    }
);

export default CreateAngularModule(
    'jupiterSideNav',
    JupiterSideNav,
    [],
    [
        '$state',
        '$rootScope',
        'AgentSvc',
        'OutboundSvc',
        'ChatSvc',
        'MonitorSvc',
        'AnalyticsSvc',
        'CHAT_EVENTS',
        'PriorityCategoriesNotificationSvc',
        'SUPERVISOR_EVENTS',
    ]
);
