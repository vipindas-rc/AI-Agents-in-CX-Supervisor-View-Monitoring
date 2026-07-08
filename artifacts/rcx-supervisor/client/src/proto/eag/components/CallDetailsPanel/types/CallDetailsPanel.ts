import type { ReactNode } from 'react';

export interface ICallDetailsPanel {
    title: string;
    headerContent?: ReactNode;
    dataPairsContainer: ReactNode;
    callUii?: string;
    confirmationFunction?: () => void;
    trackEvent?: any;
    TRACK_EVENTS?: any;
    CallSvc: any;
    AgentSvc: any;
    originatedFrom?: string;
    className?: string;
    $state?: any;
}
