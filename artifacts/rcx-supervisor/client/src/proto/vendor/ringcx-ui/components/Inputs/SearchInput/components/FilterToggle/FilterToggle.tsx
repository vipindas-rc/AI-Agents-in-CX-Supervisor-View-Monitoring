import type { FC } from 'react';
import { useState, useCallback, useEffect } from 'react';

import { StyledToggle, FilterIcon, Label } from './FilterToggle.styled';
import type { IFilterToggle } from './types';
import { handleKeyboardClick } from '../../../../../helpers/keyboard/handleKeyboardClick';

const FilterToggle: FC<IFilterToggle> = ({
    label = 'Filters',
    count,
    onToggle,
    initState = false,
}) => {
    const [isActive, setIsActive] = useState(initState);

    const onClickHandler = useCallback(() => {
        setIsActive((value) => !value);
    }, []);

    useEffect(() => {
        onToggle && onToggle(isActive);
    }, [isActive, onToggle]);

    return (
        <StyledToggle
            isActive={isActive || !!count}
            onClick={onClickHandler}
            role='button'
            tabIndex={0}
            aria-label={`${label} ${isActive ? 'active' : 'inactive'}`}
            aria-pressed={isActive || !!count}
            onKeyDown={handleKeyboardClick(onClickHandler)}
        >
            <FilterIcon aria-hidden='true' />
            <Label>
                {label}
                {!!count && ` (${count})`}
            </Label>
        </StyledToggle>
    );
};

export default FilterToggle;
