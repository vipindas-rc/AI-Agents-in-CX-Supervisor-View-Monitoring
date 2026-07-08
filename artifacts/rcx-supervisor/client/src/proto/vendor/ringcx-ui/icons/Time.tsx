import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Time: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-time'} {...props} />
);
