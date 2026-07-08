import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const MonitorBargeIn: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-barge-in' {...props} />
);
