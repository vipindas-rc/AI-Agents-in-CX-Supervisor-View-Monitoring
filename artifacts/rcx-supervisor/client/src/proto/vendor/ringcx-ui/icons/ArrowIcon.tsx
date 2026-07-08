import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const ArrowIcon: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-arrow-icon'} {...props} />
);
