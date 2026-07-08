import type { ListGroupType } from '../../ListGroup';

export type ListType = {
    items: ListGroupType[];
    onTrackAnalytics?: (event: string, property?: any) => void;
};
