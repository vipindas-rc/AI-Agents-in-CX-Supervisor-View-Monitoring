import type { FC } from 'react';

import {
    StyledListGroupHeader,
    StyledListGroupContent,
} from './ListGroup.styled';
import type { ListGroupType } from './types';
import type { ListItemType } from '../ListItem';
import { ListItem } from '../ListItem';

const ListGroup: FC<ListGroupType> = ({ name, items, onTrackAnalytics }) => (
    <div>
        {name && <StyledListGroupHeader>{name}</StyledListGroupHeader>}
        <StyledListGroupContent listLength={items.length}>
            {items.map((item: ListItemType, index) => (
                <ListItem
                    {...item}
                    key={'app-switcher-group-content' + name + index}
                    onTrackAnalytics={onTrackAnalytics}
                />
            ))}
        </StyledListGroupContent>
    </div>
);

export default ListGroup;
