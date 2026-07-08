export interface IChatMessageSendMonitoring {
    chat: any;
    monitorMessageOpen: boolean;
    sendChat: () => void;
    toggleMonitorMessage: () => void;
    updateAgentMessage: (text: string) => void;
}
