import { ListItemIcon } from '@material-ui/core';

import {
    Content,
    StyledItemText,
    StyledListItem,
    VerticalBar,
} from './NestedListItem.styled';
import { TEST_AID } from '../../../constants';
import type { ChildItemProps } from '../types';

export const ChildItem = ({
    itemId,
    itemIcon,
    itemLabel,
    onClick,
    selected = false,
}: ChildItemProps) => {
    return (
        <StyledListItem
            id={itemId}
            key={itemId}
            button
            onClick={() => onClick(itemId)}
            disableRipple={true}
            selected={selected}
            data-aid={TEST_AID.NESTED_LIST.CHILD_ITEM}
        >
            {selected && (
                <VerticalBar data-aid={TEST_AID.NESTED_LIST.VERTICAL_BAR} />
            )}
            <Content selected={selected}>
                <ListItemIcon data-aid={TEST_AID.NESTED_LIST.ICON}>
                    {itemIcon}
                </ListItemIcon>
                <StyledItemText
                    primary={itemLabel}
                    disableTypography
                    data-aid={TEST_AID.NESTED_LIST.LABEL}
                />
            </Content>
        </StyledListItem>
    );
};
