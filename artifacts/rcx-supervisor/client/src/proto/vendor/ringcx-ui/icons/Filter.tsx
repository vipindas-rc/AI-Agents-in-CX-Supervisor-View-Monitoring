import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Filter: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-filter'} {...props} />
);
