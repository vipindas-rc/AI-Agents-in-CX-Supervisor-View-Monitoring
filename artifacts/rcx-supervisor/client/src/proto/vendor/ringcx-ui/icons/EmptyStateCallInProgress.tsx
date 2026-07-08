import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const EmptyStateCallInProgress: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-emptystate-callinprogress' {...props} />
);
