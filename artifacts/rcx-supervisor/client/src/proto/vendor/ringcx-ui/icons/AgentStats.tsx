import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const AgentStats: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-agentstats'} {...props} />
);
