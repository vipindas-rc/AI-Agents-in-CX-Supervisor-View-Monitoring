import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const AgentScripts: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-agentscripts'} {...props} />
);
