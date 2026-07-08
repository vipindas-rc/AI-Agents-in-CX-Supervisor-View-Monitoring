import type { FC } from 'react';
import { memo } from 'react';

import { StyledToggleSpacer } from './ToggleSpacer.styled';
import type { IToggleSpacer } from './types';
import { ArrowDirection } from '../../../../../icons/types/Arrow';
import ArrowIcon from '../../../Components/ArrowIcon';
import { StyledPlaceholder } from '../../../DropDown.styled';

const ToggleSpacer: FC<IToggleSpacer> = ({ size, isOpen, placeholder }) => (
    <StyledToggleSpacer isOpen={isOpen} size={size}>
        <StyledPlaceholder>{placeholder}</StyledPlaceholder>
        <ArrowIcon direction={ArrowDirection.UP} />
    </StyledToggleSpacer>
);

export default memo(ToggleSpacer);
