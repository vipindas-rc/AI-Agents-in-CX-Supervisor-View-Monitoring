import { memo, isValidElement } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';

import clsx from 'clsx';

import { Item } from './GridListHead.styled';
import type { GridListHeadType } from './types';
import { TEST_AID } from '../../../../constants';
import { isActivationKey } from '../../../../helpers/keyboard';
import { SortDirection } from '../../../../helpers/sorting';
import { GL_CLASSES } from '../../constants';
import SortIcon from '../SortIcon';

const getAriaLabel = (content: ReactNode): string | undefined => {
    if (typeof content === 'string' || typeof content === 'number') {
        return String(content);
    }

    if (isValidElement(content)) {
        return undefined;
    }

    return String(content);
};

const GridListHead = <R, S>({
    header,
    isGroupedList,
    columns,
    onChangeSortState,
    sortState,
    isDisableSort,
    renderSortIcon,
    classes,
}: GridListHeadType<R, S>): JSX.Element => (
    <div
        className={clsx(GL_CLASSES.HEAD_WRAPPER, classes?.head)}
        role='presentation'
    >
        {header}
        <div
            className={clsx(
                GL_CLASSES.HEAD +
                    (isGroupedList ? ' ' + GL_CLASSES.HEAD_GROUPED : ''),
                classes?.['head-row']
            )}
            data-aid={TEST_AID.GRID_LIST.HEADER}
            role='row'
        >
            {columns.map(({ content, id, sortAs, columnAriaLabel }) => {
                const isSortable = !isDisableSort && !!sortAs;

                const direction =
                    sortState[0] === id ? sortState[1] : SortDirection.NONE;

                const handleSort = () => onChangeSortState(id, sortState);

                const handleKeyDown = (
                    event: KeyboardEvent<HTMLDivElement>
                ) => {
                    if (isActivationKey(event.key)) {
                        event.preventDefault();
                        handleSort();
                    }
                };

                const ariaLabel = isSortable
                    ? getAriaLabel(content)
                    : undefined;

                return (
                    <div
                        key={id}
                        className={clsx(classes?.['head-item-container'])}
                        role='columnheader'
                        {...(isSortable && {
                            'aria-sort':
                                direction === SortDirection.ASC
                                    ? 'ascending'
                                    : direction === SortDirection.DESC
                                      ? 'descending'
                                      : 'none',
                        })}
                    >
                        <Item
                            {...{
                                isSortable,
                                'data-aid': TEST_AID.GRID_LIST.COLUMN_HEADER,
                                ...(isSortable && {
                                    onClick: handleSort,
                                    onKeyDown: handleKeyDown,
                                    tabIndex: 0,
                                    role: 'button',
                                    'aria-label': ariaLabel,
                                }),
                                className: clsx(classes?.['head-item']),
                            }}
                            {...(columnAriaLabel && {
                                'aria-label': columnAriaLabel,
                            })}
                        >
                            {/* non-breaking space to give the element dimensions so that aria-label can provide the accessible name */}
                            {content || '\u00A0'}
                            {sortAs &&
                                (renderSortIcon ? (
                                    renderSortIcon({
                                        direction,
                                        isSortable,
                                    })
                                ) : (
                                    <SortIcon
                                        {...{
                                            direction,
                                            isSortable,
                                        }}
                                    />
                                ))}
                        </Item>
                    </div>
                );
            })}
        </div>
    </div>
);

export default memo(GridListHead) as typeof GridListHead;
