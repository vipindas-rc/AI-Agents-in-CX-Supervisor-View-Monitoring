import type { FC } from 'react';
import { Fragment } from 'react';

import {
    GroupDelimiterStyled,
    GroupNavigationStyled,
} from './GroupNavigation.styled';
import type { GroupNavigationType } from './types';

const GroupNavigation: FC<GroupNavigationType> = ({
    groupItems,
    currentEntityId,
    disabled,
    width,
    onChange,
    noResultsFoundText,
}) => (
    <Fragment>
        <GroupDelimiterStyled width={width} disabled={disabled} />
        <GroupNavigationStyled
            title={''}
            error={false}
            message={''}
            isSearchable={true}
            data={groupItems}
            selectedItemId={currentEntityId}
            onChange={onChange}
            disabled={disabled}
            widthHeader={width}
            noResultsFoundText={noResultsFoundText}
        />
    </Fragment>
);

export default GroupNavigation;
