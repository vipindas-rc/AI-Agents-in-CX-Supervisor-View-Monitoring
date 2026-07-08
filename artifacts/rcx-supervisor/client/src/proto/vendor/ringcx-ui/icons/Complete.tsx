import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Complete: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-complete'} {...props} />
);
