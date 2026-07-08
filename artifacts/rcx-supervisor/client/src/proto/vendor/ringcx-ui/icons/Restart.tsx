import type { FC } from 'react';

import EngageIcon from './EngageIcon';
import type { IIcon } from './types/Icon';

export const Restart: FC<IIcon> = (props) => (
    <EngageIcon icon={'icon-restart'} {...props} />
);
