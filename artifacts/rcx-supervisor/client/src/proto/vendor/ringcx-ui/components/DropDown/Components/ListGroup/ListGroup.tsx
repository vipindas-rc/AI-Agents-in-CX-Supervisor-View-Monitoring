import { memo } from 'react';

import { StyledListGroup } from './ListGroup.styled';
import type { IListGroup } from './types';
import { TEST_AID } from '../../../../constants';
import { UNUSED } from '../../../../helpers/usage';
import { TextEclipse } from '../../../TextEclipse';

const ListGroup = ({ item, index, ...restProps }: IListGroup) => {
    UNUSED(index);
    const { displayName } = item;
    return (
        <StyledListGroup
            {...{
                className: 'eui-dropdown-list-group',
                'data-aid': TEST_AID.DROPDOWN_LIST_GROUP_ITEM,
                ...restProps,
            }}
        >
            <TextEclipse
                {...{
                    tooltipMsg: displayName,
                }}
            >
                <span>{displayName}</span>
            </TextEclipse>
        </StyledListGroup>
    );
};

export default memo(ListGroup);
