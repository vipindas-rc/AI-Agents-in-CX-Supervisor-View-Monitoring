export interface ITopHat {
    isVisible?: boolean;
}

export interface ITopHatMicrophoneAndRNA {
    showRnaTophat?: boolean;
    showMicrophoneAccessTophat?: boolean;
    isInCRM?: boolean;
}

export interface ITopHatDisposition extends ITopHat {
    isModelOpen: boolean;
    topHeadType: string;
    dispositionModel: () => void;
    isInCRM?: boolean;
    $state?: {
        go: (path: string) => Promise<void>;
        current: { name: string };
    };
}

export interface ItopHatVersion {
    isEmbedded?: boolean;
    NotificationSvc: {
        showError(message: string): void;
    };
}
