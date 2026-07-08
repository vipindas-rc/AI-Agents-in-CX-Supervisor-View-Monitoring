declare module 'agent_ui.service.call' {
    export interface CallService {
        currentCall?: {
            dialogId: string;
            segmentId: string;
            segmentContext?: {
                dialog: {
                    channelType: 'VOICE';
                };
            };
        };
    }
}
