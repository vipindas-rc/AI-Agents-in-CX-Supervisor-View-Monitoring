import type { ListItemType } from '../../ListItem';

export type ListGroupType = {
    name?: string;
    items: ListItemType[];
    onTrackAnalytics?: (event: string, property?: any) => void;
};
