export interface ISessionInfoProps {
    agentSettings: any;
    profileName: string;
    dialGroupName: string;
    chatState: any;
    updateLogin(): void;
    agentPermissions: any;
    dialDestination: string;
    className?: string;
    onCloseSubmenu?: () => void;
    AgentSvc: any;
}
