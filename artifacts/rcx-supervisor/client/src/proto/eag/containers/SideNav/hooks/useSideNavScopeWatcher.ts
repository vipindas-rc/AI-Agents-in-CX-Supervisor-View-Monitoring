import { useEffect, useState } from 'react';

import { Session } from '@ringcx/shared';

export const useSideNavScopeWatcher = (
    $rootScope: any,
    AgentSvc: any,
    ChatSvc: any,
    MonitorSvc: any,
    OutboundSvc: any,
    CHAT_EVENTS: any,
    PriorityCategoriesNotificationSvc?: any,
    SUPERVISOR_EVENTS?: any
) => {
    const [refreshNav, setRefreshNav] = useState(0);

    useEffect(() => {
        const refreshNavItems = () =>
            setRefreshNav((state) => (state + 1) % 10);

        if (Session.isEmbeddedAgentClientAppType()) {
            [
                CHAT_EVENTS.CHAT_CANCELLED,
                CHAT_EVENTS.CHAT_PRESENTED,
                CHAT_EVENTS.PENDING_DISP,
                CHAT_EVENTS.DISP_RESPONSE,
                CHAT_EVENTS.CHAT_STATE_CHANGED,
                CHAT_EVENTS.CHAT_NEW_MESSAGE,
                SUPERVISOR_EVENTS?.NEW_PRIORITY_CATEGORY_ALERT_EVENT,
            ]
                .filter(Boolean)
                .forEach((event) => {
                    $rootScope.$on(event, () => {
                        refreshNavItems();
                    });
                });
        }

        // setup a watcher for the properties that may be changing in sideNav.service
        return $rootScope.$watchGroup(
            [
                ChatSvc.getTotalWaitingForUserCount,
                AgentSvc.isSupervisor,
                () => OutboundSvc.getDialGroup().dialGroupId, // getDialGroup makes a copy and returns a new object every time
                () => AgentSvc.agentSettings,
                () => AgentSvc.isFolderModeEnabled(),
                () => AgentSvc.agentPermissions,
                () => MonitorSvc.selectedAgent,
                () =>
                    PriorityCategoriesNotificationSvc?.getSupervisorAlertCount(),
            ],
            refreshNavItems
        );
    }, [
        $rootScope,
        AgentSvc,
        ChatSvc.getTotalWaitingForUserCount,
        MonitorSvc.selectedAgent,
        OutboundSvc,
        PriorityCategoriesNotificationSvc,
    ]);

    return refreshNav;
};
