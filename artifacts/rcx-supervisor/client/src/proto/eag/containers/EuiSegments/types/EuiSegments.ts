export interface ISegmentItem {
    title: string;
    badgeContent?: number;
}

export interface IEuiSegments {
    segmentLabels: string[];
    selectedIndex: number;
    setSelectedType: (type: string) => void;
    size?: 'small' | 'large';
    segmentsBadgeCount?: Record<string, number>;
}
