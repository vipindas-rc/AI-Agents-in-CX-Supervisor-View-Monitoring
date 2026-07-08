import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const ExpandDetails: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-expand-details'} {...props} />
);
