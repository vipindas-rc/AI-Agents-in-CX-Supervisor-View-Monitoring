import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const ScheduledCallbacks: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-scheduledcallbacks'} {...props} />
);
