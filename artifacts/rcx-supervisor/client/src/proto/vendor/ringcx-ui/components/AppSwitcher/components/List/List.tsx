import type { FC } from 'react';

import type { ListType } from './types';
import { ListGroup } from '../ListGroup';

const List: FC<ListType> = ({ items, onTrackAnalytics }) => (
    <div>
        {items.map((group, index) => (
            <ListGroup
                {...group}
                key={`app-switcher-list-group-${index}`}
                onTrackAnalytics={onTrackAnalytics}
            />
        ))}
    </div>
);

export default List;
