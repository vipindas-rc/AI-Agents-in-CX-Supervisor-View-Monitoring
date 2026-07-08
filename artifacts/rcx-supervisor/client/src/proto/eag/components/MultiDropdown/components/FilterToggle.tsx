import type { FC } from 'react';
import { useState, useCallback, useEffect } from 'react';

import { StyledToggle, FilterIcon, Label } from './filter.styled';
import type { IFilterToggle } from './types/filterTypes';
import { FILTER_TOGGLE_WRAPPER_ID } from '../../../constants/testIds';
import CreateAngularModule from '../../../helpers/CreateAngularModule';

export const FilterToggle: FC<IFilterToggle> = ({
    label = 'Filters',
    filterCount,
    onToggle,
    isOpen,
}) => {
    const [isActive, setIsActive] = useState(isOpen);

    const onClickHandler = useCallback(() => {
        setIsActive((value) => !value);
    }, []);

    useEffect(() => {
        onToggle && onToggle(isActive);
    }, [isActive, onToggle]);

    return (
        <StyledToggle
            isActive={isActive || !!filterCount}
            onClick={onClickHandler}
            data-aid={FILTER_TOGGLE_WRAPPER_ID}
        >
            <FilterIcon />
            <Label>
                {label}
                {!!filterCount && ` (${filterCount})`}
            </Label>
        </StyledToggle>
    );
};

export default CreateAngularModule(
    'filterToggle',
    FilterToggle,
    ['onToggle', 'filterCount', 'isOpen'],
    []
);
