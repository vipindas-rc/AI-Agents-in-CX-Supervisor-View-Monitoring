import { Fragment } from 'react';

import clsx from 'clsx';

import ListItem from '../ListItem';
import type { BasicListType } from './types';
import { TEST_AID } from '../../../../constants';
import { GL_KEYS } from '../../constants';

const BasicList = <R,>({
    data,
    classes,
    ...restProps
}: BasicListType<R>): JSX.Element => (
    <Fragment>
        {data.map((item) => (
            <ListItem
                key={item.glId + GL_KEYS.ROW}
                item={item}
                classes={clsx('gl-row', classes?.row)}
                data-aid={TEST_AID.GRID_LIST.ROW}
                {...restProps}
            />
        ))}
    </Fragment>
);

export default BasicList;
