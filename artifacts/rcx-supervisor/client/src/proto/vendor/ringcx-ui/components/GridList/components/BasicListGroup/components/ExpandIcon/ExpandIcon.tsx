import type { FC } from 'react';

import { ArrowIcon } from './ExpandIcon.styled';
import type { IExpandIcon } from './types';

const ExpandIcon: FC<IExpandIcon> = ({ isExpanded }) => (
    <ArrowIcon isExpanded={isExpanded} />
);

export default ExpandIcon;
