import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Merge: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-merge'} {...props} />
);
