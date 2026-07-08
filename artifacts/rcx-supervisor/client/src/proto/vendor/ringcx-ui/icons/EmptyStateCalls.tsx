import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const EmptyStateCalls: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-emptystate-calls' {...props} />
);
