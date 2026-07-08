import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Timer: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-timer' {...props} />
);
