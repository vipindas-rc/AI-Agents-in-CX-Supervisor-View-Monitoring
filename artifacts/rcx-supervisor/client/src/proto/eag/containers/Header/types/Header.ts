export interface IHeader {
    AnalyticsSvc: any;
    AuthService: any;
    AgentSvc: any;
    ChatSvc: any;
    ToolbarSvc: any;
    CallSvc: any;
    connectionStatus: boolean;
    OutboundSvc: any;
    AcdSvc: any;
    ChromeSvc: any;
    $state: any;
    $rootScope: any;
    ssoLogin?: boolean;
    handleToggleLeftMenu(): void;
    handleUpdateLogin(): void;
    showBreakTimer: boolean;
    breakTimeExpired: boolean;
    breakWaitTime: number;
    breakOver(): void;
    firstLogin: boolean;
    handleStateChange(event: any, data: any): void;
    AGENT_EVENTS: any;
    isEmbedded: boolean;
    SessionSvc: any;
}
