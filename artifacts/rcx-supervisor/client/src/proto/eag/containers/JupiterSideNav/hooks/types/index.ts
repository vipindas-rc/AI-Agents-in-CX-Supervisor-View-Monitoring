import type { NavItemProps } from '../../types';

export interface IUseJupiterNavItems {
    (props: {
        $state: any;
        $rootScope: any;
        AgentSvc: any;
        OutboundSvc: any;
        ChatSvc: any;
        MonitorSvc: any;
        CHAT_EVENTS: any;
        PriorityCategoriesNotificationSvc?: any;
        SUPERVISOR_EVENTS?: any;
    }): { items: NavItemProps[] };
}
