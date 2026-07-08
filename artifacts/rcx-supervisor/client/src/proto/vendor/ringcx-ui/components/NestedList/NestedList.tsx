import { Fragment } from 'react';

import { Divider } from '@material-ui/core';

import NestedListItem from './components/NestedListItem';
import { NO_SUBHEADER } from './constants';
import { NestedListWrapper, StyledList } from './NestedList.styled';
import type { ListItem, NestedListProps } from './types';
import { TEST_AID } from '../../constants';

export const NestedList = ({
    listItems,
    component = 'nav',
    trackAnalyticsEvent,
}: NestedListProps) => {
    return (
        <NestedListWrapper data-aid={TEST_AID.NESTED_LIST.WRAPPER}>
            <StyledList
                component={component}
                data-aid={TEST_AID.NESTED_LIST.LIST}
            >
                {listItems.map((item: ListItem) => {
                    const itemChildren =
                        item.childList?.map((childList) => ({
                            ...childList,
                            subheader: childList.subheader ?? NO_SUBHEADER,
                        })) ?? null;

                    return (
                        <Fragment key={item.id}>
                            {item.withDivider && (
                                <Divider
                                    data-aid={TEST_AID.NESTED_LIST.DIVIDER}
                                />
                            )}
                            <NestedListItem
                                id={item.id}
                                label={item.label}
                                translationKey={item.translationKey}
                                icon={item.icon}
                                childList={itemChildren}
                                trackAnalyticsEvent={trackAnalyticsEvent}
                            />
                        </Fragment>
                    );
                })}
            </StyledList>
        </NestedListWrapper>
    );
};

export default NestedList;
