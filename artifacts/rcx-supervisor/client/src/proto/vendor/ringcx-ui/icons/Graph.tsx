import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Graph: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-graph' {...props} />
);
