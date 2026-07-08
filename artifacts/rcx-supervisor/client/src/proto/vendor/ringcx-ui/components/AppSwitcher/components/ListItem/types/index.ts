import { type SyntheticEvent } from 'react';

export interface ListItemType {
    name: string;
    path: string;
    icon: string;
    openInNewTab?: boolean;
    onTrackAnalytics?: (event: string, property?: any) => void;
    onClick?: (event: SyntheticEvent) => void;
    isLoading?: boolean;
}
