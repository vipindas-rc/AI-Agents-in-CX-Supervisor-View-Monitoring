import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const CollapseDetails: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-collapse-details'} {...props} />
);
