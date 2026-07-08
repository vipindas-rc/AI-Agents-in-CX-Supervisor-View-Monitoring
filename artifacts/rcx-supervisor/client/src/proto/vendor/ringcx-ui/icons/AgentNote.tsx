import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const AgentNote: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-agentnote'} {...props} />
);
