export type AngularLikeState =
    | { current?: { name?: string } }
    | null
    | undefined;

export type VoiceCallInput = {
    callType: string;
    queue: {
        number?: string;
        isCampaign?: boolean;
        name?: string;
    };
};
