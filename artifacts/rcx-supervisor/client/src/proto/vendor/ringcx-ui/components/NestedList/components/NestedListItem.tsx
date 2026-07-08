import { Fragment, useLayoutEffect, useState } from 'react';

import { Collapse, ListItemIcon } from '@material-ui/core';
import type { Dictionary } from 'lodash';
import { groupBy } from 'lodash';

import type { ListItem } from '../types';
import { ChildItem } from './ChildItem';
import {
    ChildWrapper,
    Content,
    ContentWrapper,
    ToggleIcon,
    StyledItemText,
    StyledListItem,
    StyledSubHeader,
    VerticalBar,
} from './NestedListItem.styled';
import { TEST_AID } from '../../../constants';
import { ChevronDown, ChevronRight } from '../../../icons';
import { AnalyticsTrackingLevels, NO_SUBHEADER } from '../constants';

const NestedListItem = ({
    id,
    label,
    translationKey,
    childList,
    trackAnalyticsEvent,
    icon = null,
}: ListItem) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);
    const childGroup: Dictionary<ListItem[]> = groupBy(childList, 'subheader');
    const isChildSelected = childList?.some((child) => child.isSelected);

    useLayoutEffect(() => {
        if (isChildSelected) {
            setIsOpen(true);
        }
    }, [isChildSelected]);

    const handleChildClick = (item: ListItem) => {
        item.onClick?.();
        trackAnalyticsEvent?.({
            currentItemLabel: item.label,
            parentItemLabel: label,
            level: AnalyticsTrackingLevels.L2,
            currentItemTranslationKey: item.translationKey,
            parentItemTranslationKey: translationKey,
        });
    };

    const toggleListItem = () => {
        setIsOpen(!isOpen);
        trackAnalyticsEvent?.({
            currentItemLabel: label,
            parentItemLabel: '',
            level: AnalyticsTrackingLevels.L1,
            currentItemTranslationKey: translationKey,
        });
    };

    return (
        <Fragment>
            <StyledListItem
                id={id}
                button
                onClick={toggleListItem}
                disableRipple={true}
                isChildSelected={isChildSelected}
                isOpen={isOpen}
                data-aid={TEST_AID.NESTED_LIST.ITEM}
            >
                {isChildSelected && !isOpen && (
                    <VerticalBar data-aid={TEST_AID.NESTED_LIST.VERTICAL_BAR} />
                )}
                <ContentWrapper>
                    <Content selected={isChildSelected} isOpen={isOpen}>
                        <ListItemIcon data-aid={TEST_AID.NESTED_LIST.ICON}>
                            {icon}
                        </ListItemIcon>
                        <StyledItemText
                            primary={label}
                            disableTypography
                            data-aid={TEST_AID.NESTED_LIST.LABEL}
                        />
                    </Content>
                    <ToggleIcon>
                        {isOpen ? (
                            <ChevronDown
                                data-aid={TEST_AID.ICON.CHEVRON_DOWN}
                            />
                        ) : (
                            <ChevronRight
                                data-aid={TEST_AID.ICON.CHEVRON_RIGHT}
                            />
                        )}
                    </ToggleIcon>
                </ContentWrapper>
            </StyledListItem>
            <Collapse in={isOpen} unmountOnExit timeout={0}>
                {Object.keys(childGroup)?.map((item) => {
                    const subItems = childGroup[item];
                    return (
                        <ChildWrapper key={`list-item-sub-header-${item}`}>
                            {item === NO_SUBHEADER ? null : (
                                <StyledSubHeader
                                    data-aid={TEST_AID.NESTED_LIST.SUB_HEADER}
                                >
                                    {item}
                                </StyledSubHeader>
                            )}
                            {subItems.map((subItem) => {
                                return (
                                    <ChildItem
                                        key={subItem.id}
                                        itemId={subItem.id}
                                        itemLabel={subItem.label}
                                        itemIcon={subItem.icon}
                                        selected={!!subItem.isSelected}
                                        onClick={() =>
                                            handleChildClick(subItem)
                                        }
                                    />
                                );
                            })}
                        </ChildWrapper>
                    );
                })}
            </Collapse>
        </Fragment>
    );
};

export default NestedListItem;
