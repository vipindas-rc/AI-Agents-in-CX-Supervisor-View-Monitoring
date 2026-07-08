import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Ivr: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-ivr'} {...props} />
);
