import type { FC, RefObject } from 'react';
import { memo, useRef, useMemo, useState, useEffect, useCallback } from 'react';

import {
    StyledPopper,
    Counter,
    SelectedItems,
    BulkEditPopperWrapper,
    StyledPopperItem,
} from './BulkEditPopper.styled';
import { SELECTED_ITEMS_MAX_WIDTH } from './constants';
import type { IBulkEditPopper } from './types/BulkEditPopper';
import { TEST_AID } from '../../constants';

const BulkEditPopper: FC<IBulkEditPopper> = ({
    names,
    renderLabel = (count) => count,
    hideOnBlur = false,
    className = '',
    disabled = false,
    ...restProps
}) => {
    const ref: RefObject<HTMLElement> = useRef(null);
    const [counterVisible, setCounterVisible] = useState<boolean>(false);

    useEffect(() => {
        if (ref && ref.current) {
            const span: HTMLElement = ref.current;
            setCounterVisible(span.offsetWidth >= SELECTED_ITEMS_MAX_WIDTH);
        }
    }, [ref, names]);

    const joinedNames: string = names.join(', ');

    const renderText = useMemo(
        () => (
            <SelectedItems ref={ref} disabled={disabled}>
                {joinedNames}
            </SelectedItems>
        ),
        [disabled, joinedNames, ref]
    );

    const renderCounter = useCallback(
        (count: number) => renderLabel(count),
        [renderLabel]
    );

    const bulkEditPopper = useMemo(
        () => (
            <BulkEditPopperWrapper className={className}>
                {renderText}
                {counterVisible && (
                    <Counter
                        disabled={disabled}
                        data-aid={TEST_AID.HEADER.COUNTER}
                    >
                        {renderCounter(names.length)}
                    </Counter>
                )}
            </BulkEditPopperWrapper>
        ),
        [
            className,
            renderText,
            counterVisible,
            disabled,
            renderCounter,
            names.length,
        ]
    );

    const renderList = useMemo(
        () =>
            names.map((itemName: string, i: number) => (
                <StyledPopperItem key={i}>{itemName}</StyledPopperItem>
            )),
        [names]
    );

    if (!counterVisible) {
        return bulkEditPopper;
    }

    return (
        <StyledPopper
            showOnHover={true}
            hideOnBlur={hideOnBlur}
            toggleComponent={bulkEditPopper}
            placement='bottom-start'
            disabled={disabled}
            {...restProps}
        >
            {renderList}
        </StyledPopper>
    );
};

export default memo(BulkEditPopper);
