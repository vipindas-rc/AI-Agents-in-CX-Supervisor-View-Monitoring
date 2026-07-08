import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const MyTasks: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-mytasks'} {...props} />
);
