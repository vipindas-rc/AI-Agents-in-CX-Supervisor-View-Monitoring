export interface ISegmentsItem {
    id?: string;
    title: string;
    disabled?: boolean;
    badgeContent?: number;
}

export interface ISegmentsProps {
    index: number;
    items: ISegmentsItem[];
    size?: 'large' | 'small';
    segmentsSize?: 'auto' | 'equal';
    onChange: (index: number) => void;
}
