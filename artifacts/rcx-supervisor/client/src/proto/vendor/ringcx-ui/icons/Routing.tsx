import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Routing: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-routing'} {...props} />
);
