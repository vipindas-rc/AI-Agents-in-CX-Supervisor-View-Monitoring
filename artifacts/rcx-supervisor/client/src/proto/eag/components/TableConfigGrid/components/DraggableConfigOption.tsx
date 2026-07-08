import { useState, useCallback } from 'react';

import { Checkbox, Hamburger, TextEclipse, KEYBOARD_KEYS } from '@ringcx/ui';
import type { Identifier } from 'dnd-core';
import type { DragSourceMonitor } from 'react-dnd';
import { useDrag, useDrop } from 'react-dnd';

import { DRAG_OPTION } from '../../../constants/testIds';
import {
    DraggableConfigOptionStyled,
    OptionDragHandleStyled,
} from '../TableConfigGrid.styled';
import { DraggableItemTypes } from '../types/DraggableItemTypes';
import type { IColumnOption } from '../types/TableConfigGridTypes';

interface IDraggableConfigOption {
    id: string;
    originalIndex: number;
    findItem: (id: string) => {
        originalIndex: number;
        item: Nullable<IColumnOption>;
    };
    moveItem: (id: string, atIndex: number) => void;
    option: IColumnOption;
    totalItems: number;
}
interface DragItem {
    originalIndex: number;
    id: string;
}

export const DraggableConfigOption = (props: IDraggableConfigOption) => {
    const { option, id, originalIndex, moveItem, findItem, totalItems } = props;

    const [checked, setChecked] = useState(option.visible);
    const [checkboxElement, setCheckboxElement] =
        useState<HTMLInputElement | null>(null);

    const checkboxRef = useCallback((node: HTMLInputElement | null) => {
        setCheckboxElement(node);
    }, []);

    const handleChange = (value: boolean) => {
        option.visible = value; // update ngModel
        setChecked(value);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (originalIndex === 0) return;

        const { key } = event;
        let newIndex: number | null = null;

        if (key === KEYBOARD_KEYS.ARROW_UP && originalIndex > 1) {
            newIndex = originalIndex - 1;
        } else if (
            key === KEYBOARD_KEYS.ARROW_DOWN &&
            originalIndex < totalItems - 1
        ) {
            newIndex = originalIndex + 1;
        }

        if (newIndex !== null) {
            event.preventDefault();
            moveItem(id, newIndex);

            requestAnimationFrame(() => {
                if (checkboxElement) {
                    checkboxElement.focus();
                }
            });
        }
    };

    const [{ handlerId }, drop] = useDrop<
        DragItem,
        void,
        { handlerId: Identifier | null }
    >({
        accept: DraggableItemTypes.ITEM,
        collect(monitor) {
            return {
                handlerId: monitor.getHandlerId(),
            };
        },
        hover({ id: draggedId }: DragItem) {
            if (draggedId !== id) {
                const { originalIndex: overIndex } = findItem(id);
                if (overIndex !== -1) {
                    moveItem(draggedId, overIndex);
                }
            }
        },
    });

    const [{ isDragging }, drag] = useDrag(
        {
            type: DraggableItemTypes.ITEM,
            item: { id, originalIndex },
            collect: (
                monitor: DragSourceMonitor<{
                    id: string;
                    originalIndex: number;
                }>
            ) => ({
                isDragging: monitor.isDragging(),
            }),
            end: (item, monitor) => {
                const { id: droppedId, originalIndex } = item;
                const didDrop = monitor.didDrop();
                if (!didDrop && originalIndex !== -1) {
                    moveItem(droppedId, originalIndex);
                }
            },
        },
        [id, originalIndex, moveItem]
    );

    if (!option?.id) {
        return null;
    }

    const label = option.displayName || option.content || '';
    const labelWithEllipsis = (
        <TextEclipse tooltipMsg={label} popperProps={{ disablePortal: false }}>
            {label}
        </TextEclipse>
    );

    const ariaLabel =
        originalIndex === 0
            ? label
            : `${label}, position ${originalIndex + 1} of ${totalItems}. Press up or down arrow keys to reorder.`;

    return originalIndex === 0 ? (
        <DraggableConfigOptionStyled data-aid={DRAG_OPTION} role='listitem'>
            <Checkbox
                key={option.id}
                id={option.id}
                checked={checked}
                disabled={option.disabled}
                label={labelWithEllipsis}
                inputProps={{ 'aria-label': label }}
            />
        </DraggableConfigOptionStyled>
    ) : (
        <DraggableConfigOptionStyled
            ref={(node) => drag(drop(node))}
            isDragging={isDragging}
            data-handler-id={handlerId}
            data-aid={DRAG_OPTION}
            role='listitem'
            aria-grabbed={isDragging}
        >
            <Checkbox
                key={option.id}
                id={option.id}
                checked={option.visible}
                disabled={option.disabled === true}
                label={labelWithEllipsis}
                onChange={(e, value) => handleChange(value)}
                onKeyDown={handleKeyDown}
                inputProps={{ 'aria-label': ariaLabel }}
                inputRef={checkboxRef}
            />
            <OptionDragHandleStyled isDragging={isDragging} aria-hidden='true'>
                <Hamburger />
            </OptionDragHandleStyled>
        </DraggableConfigOptionStyled>
    );
};
