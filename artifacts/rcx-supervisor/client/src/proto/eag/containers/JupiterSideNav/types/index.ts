export type JupiterSideNavProps = {
    $state: any;
    $rootScope: any;
    AgentSvc: any;
    OutboundSvc: any;
    ChatSvc: any;
    MonitorSvc: any;
    AnalyticsSvc: any;
    CHAT_EVENTS: any;
    PriorityCategoriesNotificationSvc: any;
    SUPERVISOR_EVENTS: any;
};

export type NavItemProps = {
    label: string;
    route: {
        name: string;
        href: string;
    };
    disabled: boolean;
    value: string;
    unreadCount?: number;
};
