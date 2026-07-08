import { Fragment } from 'react';

import clsx from 'clsx';

import EmptyRow from './components/EmptyRow';
import type { BasicListGroupType } from './types';
import { TEST_AID } from '../../../../constants';
import { GL_CLASSES, GL_KEYS } from '../../constants';
import GroupedListItem from '../GroupedListItem';
import ListItem from '../ListItem';

const BasicListGroup = <R, S>({
    data,
    openState,
    onChangeOpenState,
    renderRow,
    renderSubRow,
    renderEmptyRow,
    classes,
    ariaRoleForRows,
}: BasicListGroupType<R, S>): JSX.Element => (
    <Fragment>
        {data.map((rowData) => {
            const { glId: rowId, isHidden, subRows } = rowData;
            const isOpen = subRows && openState[rowId];

            return (
                <div
                    key={rowId + GL_KEYS.ROW_GROUP}
                    className={
                        GL_CLASSES.ROW_GROUP +
                        (subRows?.length
                            ? ''
                            : ' ' + GL_CLASSES.ROW_GROUP_EMPTY)
                    }
                    data-aid={TEST_AID.GRID_LIST.ROW_GROUP}
                    role='presentation'
                >
                    {!isHidden && (
                        <GroupedListItem
                            key={rowId + GL_KEYS.ROW}
                            item={rowData}
                            classes={clsx(
                                GL_CLASSES.ROW +
                                    (isOpen ? ' ' + GL_CLASSES.ROW_OPEN : ''),
                                classes?.row
                            )}
                            renderRow={renderRow}
                            ariaRoleForRows={ariaRoleForRows}
                            onChangeOpenState={onChangeOpenState}
                            isOpen={isOpen}
                            data-aid={TEST_AID.GRID_LIST.ROW}
                        />
                    )}
                    {isOpen &&
                        (subRows.length ? (
                            subRows.map((item) => (
                                <ListItem
                                    key={item.glId + GL_KEYS.SUB_ROW}
                                    item={item}
                                    classes={clsx(
                                        GL_CLASSES.SUB_ROW,
                                        classes?.['sub-row']
                                    )}
                                    data-aid={TEST_AID.GRID_LIST.SUB_ROW}
                                    renderRow={renderSubRow}
                                    ariaRoleForRows={ariaRoleForRows}
                                    parentGlId={rowId}
                                />
                            ))
                        ) : (
                            <EmptyRow key={rowId + GL_KEYS.EMPTY_ROW}>
                                {renderEmptyRow(rowData)}
                            </EmptyRow>
                        ))}
                </div>
            );
        })}
    </Fragment>
);

export default BasicListGroup;
