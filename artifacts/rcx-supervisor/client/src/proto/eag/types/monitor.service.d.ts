export type MonitorService = {
    $call: BehaviorSubject<MonitorCall>;
};

export type MonitorCall = {
    agent: {
        agentId?: string;
    };
    type: string | null;
    duration: number;
    startTime: number | null;
    connecting: boolean;
};
