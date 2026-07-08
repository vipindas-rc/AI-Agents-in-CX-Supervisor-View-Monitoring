import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Tick: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-tick'} {...props} />
);
