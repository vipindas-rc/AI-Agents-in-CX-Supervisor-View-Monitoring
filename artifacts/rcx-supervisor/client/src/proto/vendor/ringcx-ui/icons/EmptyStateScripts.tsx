import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const EmptyStateScripts: FC<IIcon> = (props) => (
    <EngageIcon icon='icon-emptystate-scripts' {...props} />
);
