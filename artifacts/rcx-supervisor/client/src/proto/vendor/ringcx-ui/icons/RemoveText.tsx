import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const RemoveText: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-removetext'} {...props} />
);
