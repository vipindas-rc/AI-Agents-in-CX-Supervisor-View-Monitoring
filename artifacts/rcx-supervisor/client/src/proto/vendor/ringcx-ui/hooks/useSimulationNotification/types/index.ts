export type UseSimulationNotificationOptions = {
    message: string;
    isSimulation: boolean;
    onExitSimulation(): Promise<void>;
    actionTitle: string;
};
