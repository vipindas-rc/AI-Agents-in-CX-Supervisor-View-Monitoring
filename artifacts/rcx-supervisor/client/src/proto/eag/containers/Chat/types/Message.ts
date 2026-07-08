export interface Message {
    from: string;
    type: 'SYSTEM' | 'AGENT' | 'CLIENT';
    whisper: boolean;
    dts: string;
    message: string;
    detail: string;
    status: string;
    uii: string;
    accountId: string;
    dequeueAgentId: string;
    mediaLinks: [];
}
