import type { FC } from 'react';
import { Fragment, useCallback, useState } from 'react';

import { useDrop } from 'react-dnd';

import { CssGridContainer } from './components/CssGridContainer';
import { DraggableConfigOption } from './components/DraggableConfigOption';
import DndProviderWrapper from './DndProviderWrapper';
import { DraggableItemTypes } from './types/DraggableItemTypes';
import type {
    IColumnOption,
    ITableConfigGrid,
} from './types/TableConfigGridTypes';
import CreateAngularModule from '../../helpers/CreateAngularModule';

export const TableConfigGrid: FC<ITableConfigGrid> = ({
    columnOptions,
    handleOnDragEnd,
}) => {
    const [items, setItems] = useState(columnOptions);

    const findItem = useCallback(
        (id: string) => {
            const item =
                items.find((item: IColumnOption) => item.id === id) || null;
            const originalIndex = item ? items.indexOf(item) : -1;
            return {
                item,
                originalIndex,
            };
        },
        [items]
    );

    const moveItem = useCallback(
        (id: string, atIndex: number) => {
            const { item, originalIndex } = findItem(id);
            if (item) {
                items.splice(originalIndex, 1);
                items.splice(atIndex, 0, item);
                setItems([...items]);

                handleOnDragEnd([...items]);
            }
        },
        [findItem, items, setItems, handleOnDragEnd]
    );

    const [, drop] = useDrop(() => ({ accept: DraggableItemTypes.ITEM }));

    return (
        <CssGridContainer
            ref={drop}
            columns={3}
            data-aid='css-grid-container'
            className='draggable-container'
            role='list'
            aria-label='Column configuration options'
        >
            <Fragment>
                {items.map((option: IColumnOption, index: number) => (
                    <DraggableConfigOption
                        key={option.id}
                        id={option.id}
                        originalIndex={index}
                        option={option}
                        moveItem={moveItem}
                        findItem={findItem}
                        totalItems={items.length}
                    />
                ))}
            </Fragment>
        </CssGridContainer>
    );
};

export const TableConfigGridWithDndProvider = (props: ITableConfigGrid) =>
    DndProviderWrapper(<TableConfigGrid {...props} />);

export default CreateAngularModule(
    'tableConfigGrid',
    TableConfigGridWithDndProvider,
    ['columnOptions', 'handleOnDragEnd'],
    []
);
