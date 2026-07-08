import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const ListView: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-listview'} {...props} />
);
